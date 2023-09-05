import express from "express";
import morgan from "morgan";
import bp from "body-parser";
import cors from "cors";
import fs from "fs";
import puppeteer from "puppeteer";
import csvtojson from "csvtojson";
import multer from "multer";
import path from "path";
import pdf from "pdf-creator-node";
import phantom from "phantomjs-prebuilt";

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
      // Create a PDF document
      const options = {
        format: "A4",
        orientation: "portrait",
        border: "10mm",
        header: {
          height: "10mm",
          contents: '<div style="text-align: center;">PDF Header</div>',
        },
        footer: {
          height: "10mm",
          contents: {
            first: "Page 1",
            2: "Page 2",
            default:
              '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
          },
        },
      };

      const document = {
        html: htmlContent,
        // path: path.join(__dirname, "output.pdf"), // Output path for the generated PDF
        data: {},
        type: "buffer", // Output type is buffer,
        phantomPath: phantom.path,
      };

      pdf
        .create(document, options)
        .then((buffer) => {
          res.setHeader("Content-Type", "application/pdf");
          res.send(buffer);
        })
        .catch((error) => {
          console.error("Error generating PDF:", error);
          res.status(500).send("Error generating PDF");
        });
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
