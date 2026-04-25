import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface CartItem {
    product: {
        name: string;
        batchNumber?: string;
    };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    taxRate?: number | string;
    taxAmount?: number | string;
    taxCode?: string;
    discount?: number;
}

interface ThermalReceiptProps {
    cart: CartItem[];
    total: number;
    paymentMethod: string;
    receiptNumber: string;
    date: string;
    time?: string;
    customer: { name: string; phone: string; TIN?: string; id?: string };
    payed: number;
    businessName?: string;
    businessAddress?: string;
    businessTin?: string;
    welcomeMessage?: string;
    taxExemptTotal?: number;
    taxBTotal?: number;
    taxBTax?: number;
    totalTax?: number;
    itemCount?: number;
    sdcId?: string;
    sdcReceiptNumber?: string;
    internalData?: string;
    receiptSignature?: string;
    mrcNumber?: string;
    footerMessage?: string;
    qrPayload?: string;
}

const formatCurrency = (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toFixed(2);
};

const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
    cart,
    total,
    paymentMethod,
    receiptNumber,
    date,
    time,
    customer,
    payed,
    businessName = 'Your Business',
    businessAddress = '',
    businessTin = '',
    welcomeMessage = 'Welcome to our shop',
    taxExemptTotal = 0,
    taxBTotal = 0,
    taxBTax = 0,
    totalTax = 0,
    itemCount,
    sdcId = '',
    sdcReceiptNumber = '',
    internalData = '',
    receiptSignature = '',
    mrcNumber = '',
    footerMessage = 'COME BACK AGAIN',
    qrPayload,
}) => {
    const totalItems = itemCount || cart.reduce((sum, item) => sum + item.quantity, 0);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

    useEffect(() => {
        const generateQr = async () => {
            if (qrPayload) {
                try {
                    const url = await QRCode.toDataURL(qrPayload, {
                        width: 100,
                        margin: 1,
                        color: { dark: '#000000', light: '#ffffff' },
                    });
                    setQrCodeUrl(url);
                } catch (err) {
                    console.error('QR generation failed:', err);
                }
            }
        };
        generateQr();
    }, [qrPayload]);

return (
        <div className="thermal-receipt" id="thermal-receipt">
            <style>{`
                .thermal-receipt {
                    width: 300px;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 11px;
                    line-height: 1.2;
                    background: #fff;
                    padding: 10px;
                    margin: 0 auto;
                    color: #000;
                }
                .thermal-receipt .header {
                    text-align: center;
                    margin-bottom: 8px;
                }
                .thermal-receipt .business-name {
                    font-size: 13px;
                    font-weight: bold;
                }
                .thermal-receipt .business-info {
                    font-size: 10px;
                }
                .thermal-receipt .divider {
                    border-bottom: 1px dashed #333;
                    margin: 6px 0;
                }
                .thermal-receipt .divider-dotted {
                    border-bottom: 1px dotted #666;
                    margin: 4px 0;
                }
                .thermal-receipt .item-row {
                    margin-bottom: 4px;
                }
                .thermal-receipt .item-name {
                    font-weight: bold;
                }
                .thermal-receipt .item-price {
                    font-size: 10px;
                }
                .thermal-receipt .discount {
                    color: #666;
                    font-size: 10px;
                }
                .thermal-receipt .total-row {
                    display: flex;
                    justify-content: space-between;
                }
                .thermal-receipt .grand-total {
                    font-weight: bold;
                    font-size: 13px;
                    border-top: 2px solid #000;
                    padding-top: 2px;
                    margin-top: 2px;
                }
                .thermal-receipt .fiscal-section {
                    font-size: 10px;
                }
                .thermal-receipt .footer {
                    text-align: center;
                    font-size: 10px;
                }
                .thermal-receipt .qr-section {
                    text-align: center;
                    margin: 10px 0;
                }
                @media print { .thermal-receipt { width: 58mm; padding: 2mm; font-size: 10px; } }
            `}</style>

            {/* Header */}
            <div className="header">
                <div className="business-name">{businessName}</div>
                {businessAddress && <div className="business-info">{businessAddress}</div>}
                {businessTin && <div className="business-info">TIN: {businessTin}</div>}
            </div>

            <div className="divider" />

            {/* Welcome & Client */}
            <div>
                {welcomeMessage && <div>{welcomeMessage}</div>}
                {customer?.id && <div>Client ID: {customer.id}</div>}
            </div>

            <div className="divider" />

            {/* Items */}
            {cart.map((item, index) => (
                <div key={index} className="item-row">
                    <div className="item-name">{item.product.name}</div>
                    <div className="item-price">
                        {formatCurrency(item.unitPrice)}x {item.quantity.toFixed(2)} {formatCurrency(item.totalPrice)}
                        {item.taxCode ? item.taxCode : 'A-EX'}
                        {item.discount && item.discount > 0 && (
                            <span className="discount"> discount -{Math.round(item.discount / item.totalPrice * 100)}% {formatCurrency(item.discount)}</span>
                        )}
                    </div>
                </div>
            ))}

            <div className="divider-dotted" />

            {/* Totals */}
            <div className="total-row">
                <span>TOTAL</span>
                <span className="grand-total">{formatCurrency(total)}</span>
            </div>
            <div className="total-row">
                <span>TOTAL A-EX</span>
                <span>{formatCurrency(taxExemptTotal)}</span>
            </div>
            <div className="total-row">
                <span>TOTAL B-18.00%</span>
                <span>{formatCurrency(taxBTotal)}</span>
            </div>
            <div className="total-row">
                <span>TOTAL TAX B</span>
                <span>{formatCurrency(taxBTax)}</span>
            </div>
            <div className="total-row">
                <span>TOTAL TAX</span>
                <span>{formatCurrency(totalTax)}</span>
            </div>

            <div className="divider" />

            {/* Payment */}
            <div className="total-row">
                <span>{paymentMethod.toUpperCase()}</span>
                <span>{formatCurrency(payed)}</span>
            </div>
            <div className="total-row">
                <span>ITEMS NUMBER</span>
                <span>{totalItems}</span>
            </div>

            <div className="divider" />

            {/* SDC Information */}
            <div className="fiscal-section">
                <div className="header">SDC INFORMATION</div>
                <div className="total-row">
                    <span>Date:</span>
                    <span>{date}</span>
                </div>
                {time && (
                    <div className="total-row">
                        <span>Time:</span>
                        <span>{time}</span>
                    </div>
                )}
                {sdcId && (
                    <div className="total-row">
                        <span>SDC ID:</span>
                        <span>{sdcId}</span>
                    </div>
                )}
                {sdcReceiptNumber && (
                    <div className="total-row">
                        <span>RECEIPT NUMBER:</span>
                        <span>{sdcReceiptNumber} NS</span>
                    </div>
                )}
                {internalData && (
                    <div className="total-row">
                        <span>Internal Data:</span>
                    </div>
                )}
                {internalData && <div>{internalData}</div>}
                {receiptSignature && (
                    <div>
                        <div>Receipt Signature:</div>
                        <div>{receiptSignature}</div>
                    </div>
                )}
            </div>

            <div className="divider" />

            {/* Receipt Number */}
            <div className="total-row">
                <span>RECEIPT NUMBER:</span>
                <span>{receiptNumber}</span>
            </div>
            <div className="total-row">
                <span>DATE:</span>
                <span>{date}</span>
            </div>
            {time && (
                <div className="total-row">
                    <span>TIME:</span>
                    <span>{time}</span>
                </div>
            )}
            {mrcNumber && (
                <div className="total-row">
                    <span>MRC:</span>
                    <span>{mrcNumber}</span>
                </div>
            )}

            {qrCodeUrl && (
                <div className="qr-section">
                    <img src={qrCodeUrl} alt="QR Code" style={{ width: '80px', height: '80px', margin: '10px auto' }} />
                    <div className="text-center" style={{ fontSize: '9px', textAlign: 'center' }}>Scan to verify</div>
                </div>
            )}

            <div className="divider" />

            {/* Footer */}
            <div className="footer">
                <div>THANK YOU</div>
                <div>{footerMessage}</div>
            </div>
        </div>
    );
};

export default ThermalReceipt;