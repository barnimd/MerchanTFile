using System.Collections.Generic;

namespace MerchantFile.Models
{
    public class GenerateJobViewModel
    {
        public int Step { get; set; } = 1;
        public string JobId { get; set; }
        public JobMeta Meta { get; set; } = new JobMeta();
        public int SelectedPage { get; set; } = 0;

        public bool TemplateUploaded => Meta != null && !string.IsNullOrEmpty(Meta.TemplateFileName);
        public bool DataUploaded => Meta != null && !string.IsNullOrEmpty(Meta.DataFileName);

        public string TemplateMeta
        {
            get
            {
                if (Meta == null || string.IsNullOrEmpty(Meta.TemplateFileName)) return "";
                var sizeKb = Meta.TemplateFileSize / 1024.0;
                var sizeText = sizeKb < 1024 ? $"{sizeKb:0} KB" : $"{sizeKb / 1024:0.#} MB";
                var pages = Meta.TemplatePageCount > 0 ? $" · {Meta.TemplatePageCount} page" + (Meta.TemplatePageCount == 1 ? "" : "s") : "";
                var ph = Meta.Placeholders != null && Meta.Placeholders.Count > 0
                    ? $" · {Meta.Placeholders.Count} placeholder" + (Meta.Placeholders.Count == 1 ? "" : "s") + " found"
                    : "";
                return sizeText + pages + ph;
            }
        }

        public string DataMeta
        {
            get
            {
                if (Meta == null || string.IsNullOrEmpty(Meta.DataFileName)) return "";
                var sizeKb = Meta.DataFileSize / 1024.0;
                var sizeText = sizeKb < 1024 ? $"{sizeKb:0} KB" : $"{sizeKb / 1024:0.#} MB";
                var sheet = !string.IsNullOrEmpty(Meta.SheetName) ? $" · {Meta.SheetName}" : "";
                var rowText = Meta.Rows != null ? $" · {Meta.Rows.Count} row" + (Meta.Rows.Count == 1 ? "" : "s") : "";
                return sizeText + sheet + rowText;
            }
        }

        public List<ExcelRow> Rows => Meta?.Rows ?? new List<ExcelRow>();
    }
}
