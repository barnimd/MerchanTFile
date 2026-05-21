using System.Collections.Generic;
using MerchantFile.Models;

namespace MerchantFile.Services
{
    public static class SampleData
    {
        public static List<ExcelRow> Rows => new List<ExcelRow>
        {
            new ExcelRow { FullName = "Ahmad Saputra",  Nik = "3201234567890123" },
            new ExcelRow { FullName = "Siti Rahmawati", Nik = "3201234567890124" },
            new ExcelRow { FullName = "Budi Hartono",   Nik = "3275019876543210" },
            new ExcelRow { FullName = "Dewi Lestari",   Nik = "3273011122334455" },
            new ExcelRow { FullName = "Andi Wijaya",    Nik = "3174051122334477" }
        };

        public static List<RecentJob> RecentJobs => new List<RecentJob>
        {
            new RecentJob { Id = "JOB-0142", File = "pendaftaran_jan_2026.xlsx", Rows = 24, Status = "completed", At = "2 hours ago" },
            new RecentJob { Id = "JOB-0141", File = "anggota_baru_q4.xlsx",      Rows = 87, Status = "completed", At = "Yesterday"   },
            new RecentJob { Id = "JOB-0140", File = "data_peserta_seminar.xlsx", Rows = 12, Status = "completed", At = "2 days ago"  },
            new RecentJob { Id = "JOB-0139", File = "registration_form.xlsx",    Rows = 56, Status = "completed", At = "3 days ago"  }
        };
    }
}
