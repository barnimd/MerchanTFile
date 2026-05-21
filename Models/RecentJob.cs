using System;

namespace MerchantFile.Models
{
    public class RecentJob
    {
        public string Id { get; set; }
        public string File { get; set; }
        public int Rows { get; set; }
        public string Status { get; set; }
        public DateTime UpdatedAt { get; set; }

        public string RelativeTime
        {
            get
            {
                var span = DateTime.UtcNow - UpdatedAt;
                if (span.TotalMinutes < 1) return "Just now";
                if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes} minute" + ((int)span.TotalMinutes == 1 ? "" : "s") + " ago";
                if (span.TotalHours < 24) return $"{(int)span.TotalHours} hour" + ((int)span.TotalHours == 1 ? "" : "s") + " ago";
                if (span.TotalDays < 2) return "Yesterday";
                if (span.TotalDays < 30) return $"{(int)span.TotalDays} days ago";
                return UpdatedAt.ToLocalTime().ToString("MMM d, yyyy");
            }
        }
    }
}
