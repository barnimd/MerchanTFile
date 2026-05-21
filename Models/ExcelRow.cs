using System.Collections.Generic;

namespace MerchantFile.Models
{
    public class ExcelRow
    {
        public int RowNumber { get; set; }
        public string FullName { get; set; }
        public string Nik { get; set; }
        public bool IsValid { get; set; } = true;
        public List<string> Errors { get; set; } = new List<string>();
    }
}
