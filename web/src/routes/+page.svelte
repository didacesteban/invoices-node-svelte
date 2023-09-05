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
  // @ts-ignore
  /**
   * @type {{ id: any; date: any; name: any; dni: any; description: any; base: any; iva: any; irpf: any; total: any; } | null}
   */

  const deleteInvoice = (invoice) =>
    (data = data.filter((item) => item.id !== invoice.id));

  // @ts-ignore
  const downloadInvoice = async function downloadPDF(invoice) {
    try {
      const response = await axios.post(
        `${api}/invoice/download`,
        { invoice, admin },
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
        ><b>1.</b> Añade datos de facturación.</label
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
          placeholder="Email"
          on:change={(event) =>
            (admin = { ...admin, email: event.target.value })}
        />
      </div>

      <div class="flex items-center mt-4 space-x-4">
        <input
          type="text"
          class="input"
          placeholder="Dirección"
          on:change={(event) =>
            (admin = { ...admin, adress: event.target.value })}
        />
      </div>

      <div class="flex items-center mt-4 space-x-4">
        <input
          type="text"
          class="input"
          placeholder="NIF"
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
        ><b>2.</b> Abre tu excel y guarda el documento como CSV.</label
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
      <button
        type="button"
        class="px-4 button mt-4"
        on:click={() => downloadAllInvoices(data)}
        >Descargar todas las facturas</button
      >
      <table class="mt-4">
        <tr>
          <th>Nº</th>
          <th>Nombre</th>
          <th>DNI/NIE/NIF</th>
          <th>Total</th>
          <th class="text-center">Descargar</th>
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
