import express from "express";
import morgan from "morgan";
import bp from "body-parser";
import cors from "cors";
import fs from "fs";
import puppeteer from "puppeteer";
import csvtojson from "csvtojson";
import multer from "multer";
import PDFDocument from "pdfkit";
import blobStream from "blob-stream";

const { urlencoded, json } = bp;

const PORT = process.env.PORT || 3000;

const invoices = {
  invoices: [],
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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/invoices/upload", upload.single("csvFile"), (req, res) => {
  const csvData = req.file.buffer.toString();
  const jsonData = [];

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

app.post("/invoice/download", (req, res) => {
  const { invoice, admin } = req.body;
  fs.readFile("invoice_template_watermark.html", "utf8", function (err, data) {
    if (err) {
      res.json({ data: "fail" });
    }

    const htmlContent = data
      .replace("{adminName}", admin.name)
      .replace("{adminNif}", admin.nif)
      .replace("{adminAdress}", admin.adress)
      .replace("{adminPhone}", admin.phone)
      .replace("{adminEmail}", admin.email)
      .replaceAll("{date}", invoice.date)
      .replace("{id}", invoice.id)
      .replace("{name}", invoice.name)
      .replace("{dni}", invoice.dni)
      .replace("{description}", invoice.description)
      .replace("{base}", invoice.base)
      .replace("{iva}", invoice.iva)
      .replace("{irpf}", invoice.irpf)
      .replaceAll("{total}", invoice.total);

    try {
      // Create a new PDF document
      const doc = new PDFDocument();

      // Set document properties (optional)
      doc.info.Title = "Generated PDF";
      doc.info.Author = "Your Name";
      doc.info.Subject = "Sample PDF";
      doc.info.Keywords = "PDFKit, Express.js";

      // Create a buffer to store the PDF
      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);

        // Set the appropriate response headers and send the PDF
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline; filename=generated.pdf");
        res.send(pdfBuffer);
      });

      // Write the HTML content to the PDF
      doc.text(htmlContent);

      // End the document to finalize the PDF
      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Error generating PDF");
    }

    // (async () => {
    //   try {
    //     // Create a new browser instance
    //     const browser = await puppeteer.launch({
    //       headless: false,
    //       args: ["--headless"],
    //     });

    //     // Create a new page
    //     const page = await browser.newPage();

    //     // Define your local HTML content (replace this with your actual HTML)
    //     const localHtml = newInvoice;

    //     // Set the HTML content for the page
    //     await page.setContent(localHtml, { waitUntil: "networkidle0" });

    //     // Generate PDF from the page
    //     const pdfBuffer = await page.pdf({ format: "A4" });

    //     // Close the browser
    //     await browser.close();

    //     res.setHeader("Content-Type", "application/pdf");
    //     res.setHeader(
    //       "Content-Disposition",
    //       `attachment; filename="{factura_${invoice.id}.pdf"`
    //     );
    //     res.send(pdfBuffer);
    //   } catch (error) {
    //     console.error("Error:", error);
    //   }
    // })();
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

app.listen(PORT, () => {
  console.log("Server on port:", PORT);
});
