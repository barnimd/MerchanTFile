using System.Collections.Generic;

namespace MerchantFile.Models
{
    public class GenerateJobViewModel
    {
        public int Step { get; set; } = 1;
        public string JobId { get; set; }

        public string TemplateFileName { get; set; }
        public string TemplateMeta { get; set; }
        public bool TemplateUploaded { get; set; }

        public string DataFileName { get; set; }
        public string DataMeta { get; set; }
        public bool DataUploaded { get; set; }

        public List<ExcelRow> Rows { get; set; } = new List<ExcelRow>();
        public int SelectedPage { get; set; } = 0;
    }
}
