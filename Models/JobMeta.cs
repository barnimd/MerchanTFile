using System;
using System.Collections.Generic;

namespace MerchantFile.Models
{
    public class JobMeta
    {
        public string Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string Status { get; set; } = "draft";

        public string TemplateFileName { get; set; }
        public long TemplateFileSize { get; set; }
        public int TemplatePageCount { get; set; }
        public List<string> Placeholders { get; set; } = new List<string>();

        public string DataFileName { get; set; }
        public long DataFileSize { get; set; }
        public string SheetName { get; set; }
        public List<ExcelRow> Rows { get; set; } = new List<ExcelRow>();
        public int ValidRowCount { get; set; }
        public int ErrorRowCount { get; set; }

        public long OutputFileSize { get; set; }
        public bool HasOutput { get; set; }
    }
}
