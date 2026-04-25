/**
 * Simple HTML Receipt Print - No React Required
 */

interface ReceiptData {
    cart: any[];
    total: number;
    subtotal: number;
    paymentMethod: string;
    receiptNumber: string;
    date: string;
    time?: string;
    cashierName: string;
    customer: { name: string; phone: string; TIN?: string; id?: string };
    payed: number;
    change?: number;
    businessName?: string;
    businessAddress?: string;
    businessTin?: string;
    welcomeMessage?: string;
    footerMessage?: string;
    taxExemptTotal?: number;
    taxBTotal?: number;
    taxBTax?: number;
    totalTax?: number;
    sdcId?: string;
    sdcReceiptNumber?: string;
    internalData?: string;
    receiptSignature?: string;
    mrcNumber?: string;
}

function formatCurrency(amount: number): string {
    return amount.toFixed(2);
}

export function printSimpleReceipt(data: ReceiptData): void {
    const itemCount = data.cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const taxExemptTotal = data.taxExemptTotal || 0;
    const taxBTotal = data.taxBTotal || 0;
    const taxBTax = data.taxBTax || 0;
    const totalTax = data.totalTax || 0;

    const itemsHtml = data.cart.map((item: any) => `
        <div class="item-row">
            <div class="item-name">${item.product.name}</div>
            <div class="item-price">
                ${formatCurrency(item.unitPrice)}x ${item.quantity.toFixed(2)} ${formatCurrency(item.totalPrice)}
                ${item.taxCode ? item.taxCode : 'A-EX'}
                ${item.discount && item.discount > 0 ? `
                <span class="discount"> discount -${Math.round(item.discount / item.totalPrice * 100)}% ${formatCurrency(item.discount)}</span>
                ` : ''}
            </div>
        </div>
    `).join('');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Receipt - ${data.receiptNumber}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 11px;
                    line-height: 1.2;
                    width: 300px;
                    margin: 0 auto;
                    padding: 10px;
                    color: #000;
                }
                .header { text-align: center; margin-bottom: 8px; }
                .business-name { font-size: 13px; font-weight: bold; }
                .business-info { font-size: 10px; }
                .divider { border-bottom: 1px dashed #333; margin: 6px 0; }
                .divider-dotted { border-bottom: 1px dotted #666; margin: 4px 0; }
                .item-row { margin-bottom: 4px; }
                .item-name { font-weight: bold; }
                .item-price { font-size: 10px; }
                .discount { color: #666; }
                .total-row { display: flex; justify-content: space-between; }
                .grand-total { font-weight: bold; font-size: 13px; border-top: 2px solid #000; padding-top: 2px; margin-top: 2px; }
                .fiscal-section { font-size: 10px; }
                .footer { text-align: center; font-size: 10px; }
                @media print {
                    body { width: 58mm; padding: 2mm; font-size: 10px; }
                }
            </style>
        </head>
        <body>
            <!-- Header -->
            <div class="header">
                <div class="business-name">${data.businessName || 'Your Business'}</div>
                ${data.businessAddress ? `<div class="business-info">${data.businessAddress}</div>` : ''}
                ${data.businessTin ? `<div class="business-info">TIN: ${data.businessTin}</div>` : ''}
            </div>

            <div class="divider"></div>

            <!-- Welcome & Client -->
            <div>
                ${data.welcomeMessage || 'Welcome to our shop'}<br/>
                ${data.customer?.id ? `Client ID: ${data.customer.id}` : ''}
            </div>

            <div class="divider"></div>

            <!-- Items -->
            ${itemsHtml}

            <div class="divider-dotted"></div>

            <!-- Totals -->
            <div class="total-row">
                <span>TOTAL</span>
                <span class="grand-total">${formatCurrency(data.total)}</span>
            </div>
            <div class="total-row">
                <span>TOTAL A-EX</span>
                <span>${formatCurrency(taxExemptTotal)}</span>
            </div>
            <div class="total-row">
                <span>TOTAL B-18.00%</span>
                <span>${formatCurrency(taxBTotal)}</span>
            </div>
            <div class="total-row">
                <span>TOTAL TAX B</span>
                <span>${formatCurrency(taxBTax)}</span>
            </div>
            <div class="total-row">
                <span>TOTAL TAX</span>
                <span>${formatCurrency(totalTax)}</span>
            </div>

            <div class="divider"></div>

            <!-- Payment -->
            <div class="total-row">
                <span>${data.paymentMethod.toUpperCase()}</span>
                <span>${formatCurrency(data.payed)}</span>
            </div>
            <div class="total-row">
                <span>ITEMS NUMBER</span>
                <span>${itemCount}</span>
            </div>

            <div class="divider"></div>

            <!-- SDC Information -->
            <div class="fiscal-section">
                <div class="header">SDC INFORMATION</div>
                <div class="total-row">
                    <span>Date:</span>
                    <span>${data.date}</span>
                </div>
                ${data.time ? `
                <div class="total-row">
                    <span>Time:</span>
                    <span>${data.time}</span>
                </div>
                ` : ''}
                ${data.sdcId ? `
                <div class="total-row">
                    <span>SDC ID:</span>
                    <span>${data.sdcId}</span>
                </div>
                ` : ''}
                ${data.sdcReceiptNumber ? `
                <div class="total-row">
                    <span>RECEIPT NUMBER:</span>
                    <span>${data.sdcReceiptNumber} NS</span>
                </div>
                ` : ''}
                ${data.internalData ? `
                <div class="total-row">
                    <span>Internal Data:</span>
                </div>
                <div>${data.internalData}</div>
                ` : ''}
                ${data.receiptSignature ? `
                <div>
                    <div>Receipt Signature:</div>
                    <div>${data.receiptSignature}</div>
                </div>
                ` : ''}
            </div>

            <div class="divider"></div>

            <!-- Receipt Number -->
            <div class="total-row">
                <span>RECEIPT NUMBER:</span>
                <span>${data.receiptNumber}</span>
            </div>
            <div class="total-row">
                <span>DATE:</span>
                <span>${data.date}</span>
            </div>
            ${data.time ? `
            <div class="total-row">
                <span>TIME:</span>
                <span>${data.time}</span>
            </div>
            ` : ''}
            ${data.mrcNumber ? `
            <div class="total-row">
                <span>MRC:</span>
                <span>${data.mrcNumber}</span>
            </div>
            ` : ''}

            <div class="divider"></div>

            <!-- Footer -->
            <div class="footer">
                <div>THANK YOU</div>
                <div>${data.footerMessage || 'COME BACK AGAIN'}</div>
            </div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank', 'width=350,height=600');
    
    if (!printWindow) {
        console.error('Failed to open print window');
        return;
    }

    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

export default printSimpleReceipt;