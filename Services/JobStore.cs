using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web.Hosting;
using MerchantFile.Models;
using Newtonsoft.Json;

namespace MerchantFile.Services
{
    public class JobStore
    {
        private readonly string _root;

        public JobStore()
        {
            _root = HostingEnvironment.MapPath("~/App_Data/jobs") ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "App_Data", "jobs");
            Directory.CreateDirectory(_root);
        }

        public string NewJob()
        {
            string id;
            string dir;
            // Match the prototype's "JOB-####" cosmetic; collide-check via dir existence.
            var rng = new Random();
            do
            {
                id = "JOB-" + rng.Next(100, 9999).ToString("0000");
                dir = Path.Combine(_root, id);
            } while (Directory.Exists(dir));

            Directory.CreateDirectory(dir);
            var meta = new JobMeta
            {
                Id = id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Status = "draft"
            };
            Save(meta);
            return id;
        }

        public bool Exists(string jobId)
        {
            if (string.IsNullOrWhiteSpace(jobId)) return false;
            return Directory.Exists(Path.Combine(_root, jobId));
        }

        public string GetJobDir(string jobId)
        {
            var dir = Path.Combine(_root, jobId);
            Directory.CreateDirectory(dir);
            return dir;
        }

        public JobMeta Load(string jobId)
        {
            if (string.IsNullOrWhiteSpace(jobId)) return null;
            var path = Path.Combine(_root, jobId, "meta.json");
            if (!File.Exists(path)) return null;
            try
            {
                var json = File.ReadAllText(path);
                return JsonConvert.DeserializeObject<JobMeta>(json);
            }
            catch
            {
                return null;
            }
        }

        public void Save(JobMeta meta)
        {
            if (meta == null || string.IsNullOrWhiteSpace(meta.Id)) return;
            meta.UpdatedAt = DateTime.UtcNow;
            var dir = GetJobDir(meta.Id);
            var path = Path.Combine(dir, "meta.json");
            var json = JsonConvert.SerializeObject(meta, Formatting.Indented);
            File.WriteAllText(path, json);
        }

        public void Delete(string jobId)
        {
            if (string.IsNullOrWhiteSpace(jobId)) return;
            var dir = Path.Combine(_root, jobId);
            if (Directory.Exists(dir))
            {
                try { Directory.Delete(dir, true); } catch { /* best effort */ }
            }
        }

        public List<RecentJob> GetRecent(int take = 4)
        {
            return EnumerateAll().Take(take).ToList();
        }

        public List<RecentJob> GetAll()
        {
            return EnumerateAll().ToList();
        }

        private IEnumerable<RecentJob> EnumerateAll()
        {
            if (!Directory.Exists(_root)) yield break;
            var dirs = Directory.EnumerateDirectories(_root)
                .Select(d => new { Dir = d, Meta = Path.Combine(d, "meta.json") })
                .Where(x => File.Exists(x.Meta))
                .OrderByDescending(x => File.GetLastWriteTimeUtc(x.Meta));

            foreach (var d in dirs)
            {
                JobMeta m = null;
                try { m = JsonConvert.DeserializeObject<JobMeta>(File.ReadAllText(d.Meta)); }
                catch { continue; }
                if (m == null) continue;

                // Skip drafts that never had data attached.
                if (string.IsNullOrEmpty(m.DataFileName) && string.IsNullOrEmpty(m.TemplateFileName)) continue;

                yield return new RecentJob
                {
                    Id = m.Id,
                    File = string.IsNullOrEmpty(m.DataFileName) ? (m.TemplateFileName ?? "(no file)") : m.DataFileName,
                    Rows = m.Rows?.Count ?? 0,
                    Status = m.Status,
                    UpdatedAt = m.UpdatedAt
                };
            }
        }

        public void GarbageCollect(TimeSpan olderThan)
        {
            if (!Directory.Exists(_root)) return;
            var cutoff = DateTime.UtcNow - olderThan;
            foreach (var dir in Directory.EnumerateDirectories(_root))
            {
                try
                {
                    var info = new DirectoryInfo(dir);
                    if (info.LastWriteTimeUtc < cutoff)
                    {
                        Directory.Delete(dir, true);
                    }
                }
                catch { /* best effort */ }
            }
        }
    }
}
