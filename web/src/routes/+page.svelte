<script>
	import axios from 'axios';
	import { onMount } from 'svelte';

	let data = [];
	let selectedInvoice = null;

	const fetchData = async () => {
		const response = await fetch('http://localhost:3000/invoice/');
		const json = await response.json();
		data = json;
	};

	const downloadInvoice = async (invoice) => {
		axios
			.post('http://localhost:3000/invoice/download', { invoice })
			.then((res) => {
				console.log(res.data);
			})
			.catch((err) => {
				console.log('Error: ', err.message);
			});
	};

	const downloadAllInvoices = async (invoices) => {
		invoices.forEach((invoice) => {
			if (invoice.id) {
				axios
					.post('http://localhost:3000/invoice/download', { invoice })
					.then((res) => {
						console.log(res.data);
					})
					.catch((err) => {
						console.log('Error: ', err.message);
					});
			}
		});
	};

	const csvToJson = async (csv) => {
		axios
			.post('http://localhost:3000/invoice/csvtojson', { csvData: csv })
			.then((response) => {
				data = response.data;
			})
			.catch((error) => {
				console.error('Error:', error.message);
			});
	};

	const setSelectedInvoice = (invoice) => (selectedInvoice = invoice);

	onMount(() => {
		fetchData();
	});
</script>

<svelte:head>
	<title>Invoices</title>
	<meta name="description" content="Invoices" />
</svelte:head>

{#if !selectedInvoice}
	<button
		type="button"
		class="button"
		on:click={() => csvToJson(document.getElementById('textarea').value)}>csv to json</button
	>
	<button type="button" class="button" on:click={() => downloadAllInvoices(data)}
		>Download all invoices</button
	>
	<div class="container">
		<textarea id="textarea" />
		<table>
			<!-- <tr>
			<th>Name</th>
			<th>Dni</th>
			<th>Base</th>
		</tr> -->
			{#each data as item}
				{#if item.id && item.id !== ''}
					<tr>
						<td>{item.id}</td>
						<td>{item.name}</td>
						<td>{item.dni}</td>
						<td>{item.base}</td>
						<td><button type="button" on:click={() => setSelectedInvoice(item)}>open</button></td>
						<td><button type="button" on:click={() => downloadInvoice(item)}>download</button></td>
					</tr>
				{/if}
			{/each}
		</table>
	</div>
{/if}

{#if selectedInvoice}
	<div on:keydown={() => setSelectedInvoice(null)} on:click={() => setSelectedInvoice(null)}>
		<table cellpadding="0" cellspacing="0">
			<tr class="top">
				<td colspan="6">
					<table>
						<tr>
							<td class="title">
								<!-- <img src="https://www.sparksuite.com/images/logo.png" style="width: 100%; max-width: 300px" /> -->
							</td>

							<td style="text-align: right">
								Factura #: <b>{selectedInvoice.id}</b><br />
								Fecha: <b>{selectedInvoice.date}</b><br />
							</td>
						</tr>
					</table>
				</td>
			</tr>

			<tr class="information">
				<td colspan="6">
					<table>
						<tr>
							<td>
								María Valentina Reyes Martínez<br />
								Y3026929-M<br />
								Calle Gran Canaria 24, Sabadell, 08205<br />
								692453823<br />
								valenreyes.nutricion@gmail.com
							</td>

							<td style="text-align: right">
								{selectedInvoice.date}<br />
								{selectedInvoice.name}<br />
								{selectedInvoice.dni}
							</td>
						</tr>
					</table>
				</td>
			</tr>

			<tr class="heading">
				<td>Cantidad</td>
				<td>Descripción</td>
				<td>Precio unitario</td>
				<td>IVA (21%)</td>
				<td>IRPF (15%)</td>
				<td style="text-align: right">Importe</td>
			</tr>

			<tr class="item">
				<td>1</td>
				<td>{selectedInvoice.description}</td>
				<td>{selectedInvoice.base}</td>
				<td>{selectedInvoice.iva}</td>
				<td>{selectedInvoice.irpf}</td>
				<td style="text-align: right">{selectedInvoice.total}</td>
			</tr>

			<tr class="total">
				<td />
				<td />
				<td />
				<td />
				<td />
				<td style="text-align: right">Total: <b>{selectedInvoice.total}</b></td>
			</tr>
		</table>
	</div>
{/if}

<style>
	table {
		font-family: arial, sans-serif;
		border-collapse: collapse;
		width: 100%;
	}

	td,
	th {
		border: 1px solid #dddddd;
		text-align: left;
		padding: 8px;
	}

	tr:nth-child(even) {
		background-color: #dddddd;
	}
	.invoice-box {
		max-width: 800px;
		margin: auto;
		padding: 30px;
		border: 1px solid #eee;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
		font-size: 16px;
		line-height: 24px;
		font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
		color: #555;
	}

	.invoice-box table {
		width: 100%;
		line-height: inherit;
		/* text-align: left; */
	}

	.invoice-box table td {
		padding: 5px;
		vertical-align: top;
	}

	.invoice-box table tr td:nth-child(2) {
		/* text-align: right; */
	}

	.invoice-box table tr.top table td {
		padding-bottom: 20px;
	}

	.invoice-box table tr.top table td.title {
		font-size: 45px;
		line-height: 45px;
		color: #333;
	}

	.invoice-box table tr.information table td {
		padding-bottom: 40px;
	}

	.invoice-box table tr.heading td {
		background: #eee;
		border-bottom: 1px solid #ddd;
		font-weight: bold;
	}

	.invoice-box table tr.details td {
		padding-bottom: 20px;
	}

	.invoice-box table tr.item td {
		border-bottom: 1px solid #eee;
	}

	.invoice-box table tr.item.last td {
		border-bottom: none;
	}

	.invoice-box table tr.total td:nth-child(2) {
		/* border-top: 2px solid #eee; */
		font-weight: bold;
	}

	@media only screen and (max-width: 600px) {
		.invoice-box table tr.top table td {
			width: 100%;
			display: block;
			/* text-align: center; */
		}

		.invoice-box table tr.information table td {
			width: 100%;
			display: block;
			/* text-align: center; */
		}
	}

	/** RTL **/
	.invoice-box.rtl {
		direction: rtl;
		font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
	}
</style>
