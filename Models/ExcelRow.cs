namespace MerchantFile.Models
{
    public class ExcelRow
    {
        public string FullName { get; set; }
        public string Nik { get; set; }
        public bool IsValid { get; set; } = true;
        public string Error { get; set; }
    }
}
