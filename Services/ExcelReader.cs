using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using ClosedXML.Excel;
using MerchantFile.Models;

namespace MerchantFile.Services
{
    public class ExcelReadResult
    {
        public string SheetName { get; set; }
        public List<ExcelRow> Rows { get; set; } = new List<ExcelRow>();
        public int ValidCount { get; set; }
        public int ErrorCount { get; set; }
        public string FatalError { get; set; }
    }

    public class ExcelReader
    {
        private static readonly string[] NameAliases = { "Full Name", "Nama", "Nama Lengkap", "Name" };
        private static readonly string[] NikAliases = { "NIK", "Card ID", "ID", "No KTP" };

        public ExcelReadResult Read(Stream xlsxStream)
        {
            var result = new ExcelReadResult();
            try
            {
                using (var wb = new XLWorkbook(xlsxStream))
                {
                    var ws = wb.Worksheets.First();
                    result.SheetName = ws.Name;

                    var headerRow = ws.Row(1);
                    var nameCol = FindCol(headerRow, NameAliases);
                    var nikCol = FindCol(headerRow, NikAliases);

                    if (nameCol == 0 || nikCol == 0)
                    {
                        result.FatalError = "Could not find required columns. Expected a header row with " +
                                            "\"Full Name\" (or Nama / Nama Lengkap / Name) and \"NIK\" (or Card ID / ID).";
                        return result;
                    }

                    var rng = ws.RangeUsed();
                    if (rng == null) return result;

                    var lastRow = rng.LastRow().RowNumber();
                    int displayIndex = 0;
                    for (int r = 2; r <= lastRow; r++)
                    {
                        var fullName = ws.Cell(r, nameCol).GetString().Trim();
                        var nik = ws.Cell(r, nikCol).GetString().Trim();
                        if (string.IsNullOrEmpty(fullName) && string.IsNullOrEmpty(nik)) continue;

                        displayIndex++;
                        var row = new ExcelRow
                        {
                            RowNumber = displayIndex,
                            FullName = fullName,
                            Nik = nik
                        };

                        if (string.IsNullOrEmpty(fullName))
                        {
                            row.IsValid = false;
                            row.Errors.Add("Full Name is empty");
                        }
                        if (!Regex.IsMatch(nik ?? "", @"^\d{16}$"))
                        {
                            row.IsValid = false;
                            row.Errors.Add("NIK must be exactly 16 digits");
                        }

                        if (row.IsValid) result.ValidCount++;
                        else result.ErrorCount++;
                        result.Rows.Add(row);
                    }
                }
            }
            catch (Exception ex)
            {
                result.FatalError = "Could not read spreadsheet: " + ex.Message;
            }
            return result;
        }

        private static int FindCol(IXLRow headerRow, IEnumerable<string> aliases)
        {
            var cells = headerRow.CellsUsed().ToList();
            foreach (var cell in cells)
            {
                var v = (cell.GetString() ?? "").Trim();
                if (aliases.Any(a => string.Equals(a, v, StringComparison.OrdinalIgnoreCase)))
                {
                    return cell.Address.ColumnNumber;
                }
            }
            return 0;
        }
    }
}
