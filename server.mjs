import express from "express";
import morgan from "morgan";
import bp from "body-parser";
import cors from "cors";
import fs from "fs";
import puppeteer from "puppeteer";
import csvtojson from "csvtojson";
import { readFile } from "fs/promises";

const invoicesJSON = JSON.parse(
  await readFile(new URL("./invoices_db.json", import.meta.url))
);

const { urlencoded, json } = bp;

const invoices = {
  invoices: invoicesJSON ? [...invoicesJSON] : [],
};

const app = express();
const allowedOrigins = ["http://127.0.0.1:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("origin ", origin);
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS ", origin));
      }
    },
  })
);
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(morgan("dev"));

app.get("/invoice", (req, res) => {
  res.json(invoices.invoices);
});

app.get("/invoice/:id", (req, res) => {
  const selectedInvoice = invoices.invoices.find(
    (invoice) => invoice.id === req.params.id
  );

  res.json({ ...selectedInvoice });
});

app.post("/invoice/download", (req, res) => {
  const { invoice } = req.body;
  fs.readFile("invoice_template.html", "utf8", function (err, data) {
    if (err) {
      res.json({ data: "fail" });
    }

    const newInvoice = data
      .replaceAll("{date}", invoice.date)
      .replace("{id}", invoice.id)
      .replace("{name}", invoice.name)
      .replace("{dni}", invoice.dni)
      .replace("{description}", invoice.description)
      .replace("{base}", invoice.base)
      .replace("{iva}", invoice.iva)
      .replace("{irpf}", invoice.irpf)
      .replaceAll("{total}", invoice.total);

    (async () => {
      // Create a new browser instance
      const browser = await puppeteer.launch();

      // Create a new page
      const page = await browser.newPage();

      // Define your local HTML content
      const localHtml = newInvoice;

      // Set the HTML content for the page
      await page.setContent(localHtml, { waitUntil: "networkidle0" });

      // Generate PDF from the page
      const pdfBuffer = await page.pdf({ format: "A4" });

      // Save the PDF to a file using fs
      fs.writeFileSync(
        `invoices/factura_${invoice.id}_${invoice.name}.pdf`,
        pdfBuffer
      );

      // Close the browser
      await browser.close();
      res.json({ data: "HTML file created!" });
    })();
  });
});

app.post("/invoice/csvtojson", (req, res) => {
  const { csvData } = req.body;

  if (!csvData) {
    return res
      .status(400)
      .json({ error: "CSV data is missing in the request body." });
  }

  csvtojson({ noheader: true })
    .fromString(csvData)
    .then((jsonArray) => {
      const newArray = jsonArray.map((obj) => {
        return {
          date: obj.field1,
          id: obj.field2,
          name: obj.field3,
          dni: obj.field4,
          description: obj.field5,
          base: obj.field6,
          iva: obj.field7,
          irpf: obj.field8,
          total: obj.field9,
        };
      });
      res.json(newArray);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

app.listen(3000, () => {
  console.log("Server on http://localhost:3000");
});
