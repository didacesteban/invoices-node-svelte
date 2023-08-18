import xlsx from "xlsx";
import axios from "axios";

const printInvoice = (invoice) => {
  // Load the workbook
  const workbook = xlsx.readFile("invoice.xlsx");

  // // Select the worksheet you want to edit
  const worksheet = workbook.Sheets["sin 7%"];
  // // Update the value of a cell
  worksheet["A3"].v = invoice.name;
  worksheet["A3"].t = "s";
  worksheet["A3"].s = worksheet["A3"].s;
  //   worksheet["D3"].v = invoice.date;
  //   worksheet["A4"].v = invoice.dni;
  //   worksheet["D4"].v = invoice.id;
  //   worksheet["C15"].v = invoice.base;
  //   worksheet["D15"].v = invoice.base;
  //   worksheet["D20"].v = invoice.base;
  //   worksheet["D22"].v = invoice.iva;
  //   worksheet["D23"].v = invoice.total;
  //   worksheet["B15"].v = invoice.description;

  // // Save the workbook
  xlsx.writeFile(workbook, "invoice_modified.xlsx");
};

const getTodo = () => {
  axios
    .get("http://localhost:3000/invoice/2023-3")
    .then((res) => {
      printInvoice(res.data);
    })
    .catch((err) => {
      console.log("Error: ", err.message);
    });
};

getTodo();
