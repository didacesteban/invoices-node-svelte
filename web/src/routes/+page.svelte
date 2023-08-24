<script>
  // @ts-nocheck

  // @ts-ignore
  import axios from "axios";
  import { onMount } from "svelte";

  // @ts-ignore
  /**
   * @type {any[]}
   */
  let data = [];
  // @ts-ignore
  /**
   * @type {{ id: any; date: any; name: any; dni: any; description: any; base: any; iva: any; irpf: any; total: any; } | null}
   */

  const fetchData = async () => {
    const response = await fetch("http://localhost:3000/invoice/");
    const json = await response.json();
    data = json;
  };

  // @ts-ignore
  const downloadInvoice = async function downloadPDF(invoice) {
    try {
      const response = await axios.post(
        "http://localhost:3000/invoice/download",
        { invoice },
        {
          responseType: "arraybuffer", // To get binary data as ArrayBuffer
        }
      );

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `factura_${invoice.id}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  // @ts-ignore
  const downloadAllInvoices = (invoices) => {
    // @ts-ignore
    invoices.forEach((invoice) => {
      if (invoice.id) {
        downloadInvoice(invoice);
      }
    });
  };

  // @ts-ignore
  const csvToJson = async (csv) => {
    axios
      .post("http://localhost:3000/invoice/csvtojson", { csvData: csv })
      // @ts-ignore
      .then((response) => {
        data = response.data;
      })
      // @ts-ignore
      .catch((error) => {
        console.error("Error:", error.message);
      });
  };
</script>

<svelte:head>
  <title>Excel a Factura en pdf</title>
  <meta name="description" content="Excel a Factura en pdf" />
</svelte:head>
<div class="p-4 flex flex-col justify-center min-h-screen max-w-3xl mx-auto">
  <div class="flex flex-col w-full p-6 bg-sky-100 rounded">
    <div class="flex items-center justify-center font-black m-3 mb-12">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-10 w-10 mr-3 text-red-600 animate-pulse"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clip-rule="evenodd"
        />
      </svg>
      <h1 class="tracking-wide text-3xl text-gray-900">Excel a PDF</h1>
    </div>
    {#if !data.length}
      <label class="text-sm font-medium"
        ><b>1.</b> Abre tu excel y guarda el documento como CSV. Abre el CSV con
        un programa para leer texto y copia los datos tal y como aparecen en el archivo,
        sin cambiar saltos de linea ni nada del formato.</label
      >
      <label class="text-sm font-medium mt-4"
        ><b>2.</b> Abre el CSV con un programa para leer texto y copia los datos
        tal y como aparecen en el archivo, sin cambiar saltos de linea ni nada del
        formato.</label
      >
      <textarea
        id="textarea"
        rows="15"
        class="mt-4 focus:outline-none w-full
		mb-3 mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400"
        placeholder="Pega aquí el csv de tu tabla de excel"
      />
      <button
        type="button"
        class="mt-4 button"
        on:click={() => csvToJson(document.getElementById("textarea").value)}
        >Cargar datos</button
      >
    {/if}

    {#if data.length}
      <label class="text-sm font-medium mt-4"
        >Para descargar todas las facturas en pdf pulsa el siguiente boton:</label
      >
      <button
        type="button"
        class="px-4 button mt-4"
        on:click={() => downloadAllInvoices(data)}
        >Descargar todas las facturas</button
      >
      <table class="mt-4">
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Dni</th>
          <th>Base</th>
          <th class="text-center">Descargar</th>
        </tr>
        {#each data as item}
          {#if item.id && item.id !== ""}
            <tr>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.dni}</td>
              <td>{item.base}</td>
              <td class="text-center"
                ><button
                  type="button"
                  class="button"
                  on:click={() => downloadInvoice(item)}
                  ><svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-arrow-down-square"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm8.5 2.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"
                    />
                  </svg></button
                ></td
              >
            </tr>
          {/if}
        {/each}
      </table>
    {/if}
  </div>
</div>
