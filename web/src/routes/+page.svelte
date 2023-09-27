<script>
  // @ts-nocheck
  // @ts-ignore
  import axios from "axios";

  // const api = "https://invoices-node-svelte-production.up.railway.app";
  const api = "http://localhost:3000";

  // @ts-ignore
  /**
   * @type {any[]}
   */
  let data = [];
  let admin = { name: "", id: "", adress: "", phone: "", email: "" };
  let selectedFile;
  let loading = false;
  // @ts-ignore
  /**
   * @type {{ id: any; date: any; name: any; dni: any; description: any; base: any; iva: any; irpf: any; total: any; } | null}
   */

  const deleteInvoice = (invoice) =>
    (data = data.filter((item) => item.id !== invoice.id));

  // @ts-ignore
  const openInvoice = async function downloadPDF(invoice) {
    try {
      const response = await axios.post(`${api}/invoice/download`, {
        invoice,
        admin,
      });

      var myWindow = window.open("", "response", "resizable=yes");
      return myWindow.document.write(response.data);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  function pause(msec) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, msec || 1000);
    });
  }

  const downloadInvoice = async function downloadPDF(invoice, isLastInvoice) {
    try {
      const response = await axios.post(`${api}/invoice/download`, {
        invoice,
        admin,
      });

      const options = {
        filename: `factura_${invoice.id}.pdf`,
        margin: 10,
        // html2canvas: { width: 1000, useCORS: true },
      };

      if (invoice.id) {
        html2pdf().from(response.data).set(options).toPdf().save();
      }
      // let link = document.createElement("a");
      // link.target = "_blank";
      // link.href = pdf.output("bloburl");
      // link.download = `factura_${invoice.id}.pdf`;
      // link.click();
      // link.remove();
      if (isLastInvoice) {
        loading = false;
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  // @ts-ignore
  async function downloadAllInvoices(invoices) {
    let count = 0;
    loading = true;
    for (let i = 0; i < invoices.length; i++) {
      const invoice = invoices[i];
      downloadInvoice(invoice, i === invoices.length - 1);

      if (++count >= 5) {
        await pause(1500);
        count = 0;
      }
    }
  }

  async function uploadFile() {
    const formData = new FormData();
    formData.append("csvFile", selectedFile);

    const response = await fetch(`${api}/invoices/upload`, {
      method: "POST",
      body: formData,
    });

    data = await response.json();
  }
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
        ><b>1.</b> Añade tus datos de facturación.</label
      >
      <div class="flex items-center mt-4 space-x-4">
        <input
          type="text"
          class="input"
          placeholder="Nombre y apellidos"
          on:change={(event) =>
            (admin = { ...admin, name: event.target.value })}
        />
        <input
          type="text"
          class="input"
          placeholder="E-mail"
          on:change={(event) =>
            (admin = { ...admin, email: event.target.value })}
        />
      </div>

      <div class="flex items-center mt-4 space-x-4">
        <input
          type="text"
          class="input"
          placeholder="Dirección fiscal"
          on:change={(event) =>
            (admin = { ...admin, adress: event.target.value })}
        />
      </div>

      <div class="flex items-center mt-4 space-x-4">
        <input
          type="text"
          class="input"
          placeholder="NIF / CIF"
          on:change={(event) => (admin = { ...admin, nif: event.target.value })}
        />
        <input
          type="text"
          class="input"
          placeholder="Teléfono"
          on:change={(event) =>
            (admin = { ...admin, phone: event.target.value })}
        />
      </div>

      <label class="text-sm font-medium mt-4"
        ><b>2.</b> Después de completar tu excel, guarda la página en formato CSV.</label
      >
      <label class="text-sm font-medium mt-4"
        ><b>3.</b> Selecciona o arrastra el archivo CSV en el campo de debajo.</label
      >
      <div class="flex items-center justify-center w-full mt-4 relative">
        {#if !selectedFile}
          <label
            for="dropzone-file"
            class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
          >
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                class="w-10 h-10 mb-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                /></svg
              >
              <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span class="font-semibold">Haz click para seleccionar </span> o
                arrastra y suelta tu <b>CSV</b>.
              </p>
            </div>
            <input
              id="dropzone-file"
              type="file"
              class="absolute w-full h-full opacity-0"
              on:change={(e) => {
                selectedFile = e.target.files[0];
              }}
            />
          </label>
        {/if}
      </div>
      {#if selectedFile}
        <div class="flex space-x-4 items-center">
          <div class="input bg-white w-full">{selectedFile.name}</div>
          <button
            type="button"
            class="button"
            on:click={() => (selectedFile = null)}>Cancelar</button
          >
        </div>
      {/if}
      <button
        type="button"
        class="px-4 button mt-4"
        on:click={() => uploadFile()}>Cargar datos</button
      >
    {/if}

    {#if data.length}
      <label class="text-sm font-medium mt-4"
        >Para descargar todas las facturas en pdf pulsa el siguiente boton:</label
      >
      {#if !loading}
        <button
          type="button"
          class="px-4 button mt-4"
          on:click={() => downloadAllInvoices(data)}
          >Descargar todas las facturas</button
        >
      {/if}
      {#if loading}
        <div class="inline-flex items-center justify-center px-4 button mt-4">
          <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg> Descargando facturas...
        </div>
      {/if}
      <table class="mt-4">
        <tr>
          <th>Nº</th>
          <th>Nombre</th>
          <th>DNI/NIE/NIF</th>
          <th>Total</th>
          <th class="text-center">Ver</th>
          <th class="text-center">Eliminar</th>
        </tr>
        {#each data as item}
          {#if item.id && item.id !== ""}
            <tr>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.dni}</td>
              <td>{item.total}</td>
              <td class="text-center"
                ><button
                  type="button"
                  class="button stroke-white fill-white"
                  on:click={() => openInvoice(item)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    ><path
                      d="M15 12c0 1.654-1.346 3-3 3s-3-1.346-3-3 1.346-3 3-3 3 1.346 3 3zm9-.449s-4.252 8.449-11.985 8.449c-7.18 0-12.015-8.449-12.015-8.449s4.446-7.551 12.015-7.551c7.694 0 11.985 7.551 11.985 7.551zm-7 .449c0-2.757-2.243-5-5-5s-5 2.243-5 5 2.243 5 5 5 5-2.243 5-5z"
                    /></svg
                  >
                </button></td
              >
              <td class="text-center"
                ><button
                  type="button"
                  class="button"
                  on:click={() => deleteInvoice(item)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-trash"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"
                    />
                    <path
                      fill-rule="evenodd"
                      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                    />
                  </svg>
                </button></td
              >
            </tr>
          {/if}
        {/each}
      </table>
    {/if}
  </div>
</div>
