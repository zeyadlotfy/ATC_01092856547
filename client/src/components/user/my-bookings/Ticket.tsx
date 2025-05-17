"use client";
import React, { useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { Download, Calendar, Clock, MapPin, Ticket, CheckCircle } from "lucide-react";
import Image from "next/image";
import { toast, ToastContentProps } from "react-toastify";


type EventTicketProps = {
    booking: any;
    t: (key: string) => string;
    locale: string;
    theme: string;
};

const EventTicket = React.forwardRef<HTMLDivElement, EventTicketProps>(({ booking, t, locale, theme }, ref) => {
    const isRtl = locale === "ar";
    const isDark = theme === "dark";

    const formatDate = (dateString: string | number | Date) => {
        try {
            if (!dateString) return t("bookings.notAvailable");
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return t("bookings.notAvailable");
            }
            return format(date, "MMMM dd, yyyy");
        } catch (error) {
            return t("bookings.notAvailable");
        }
    };

    const formatTime = (dateString: string | number | Date) => {
        try {
            if (!dateString) return t("bookings.notAvailable");
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return t("bookings.notAvailable");
            }
            return format(date, "h:mm a");
        } catch (error) {
            return t("bookings.notAvailable");
        }
    };


    return (
        <div
            ref={ref}
            className="w-[800px] h-[400px] bg-white relative overflow-hidden"
            style={{ fontFamily: 'Arial, sans-serif' }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 z-0">
                <div className="absolute inset-0 bg-repeat" style={{
                    backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSIjOTMzM0VBIj48cGF0aCBkPSJNMzAgMEM0MC40OTMgMCA0OS4xODIgNy4xNjcgNTQuNjMgMTguMDgyIDE1LjQwOCAxOC4wODIgMTguMDgyIDU0LjYzIDE4LjA4MiA1NC42MyA3LjE2NyA0OS4xODIgMCAzMC42MDcgMCAzMCAyLjkxOSAxMi42NDkgMTUuMDUzIDAgMzAgMFoiLz48cGF0aCBkPSJNMzAgNjBDMTkuNTA3IDYwIDEwLjgxOCA1Mi44MzMgNS4zNyA0MS45MTggNDQuNTkyIDQxLjkxOCA0MS45MTggNS4zNyA0MS45MTggNS4zNyA1Mi44MzMgMTAuODE4IDYwIDI5LjM5MyA2MCAzMCA1Ny4wODEgNDcuMzUxIDQ0Ljk0NyA2MCAzMCA2MFoiLz48L2c+PC9zdmc+')",
                    backgroundSize: '60px 60px'
                }}></div>
            </div>

            {/* Color Border */}
            <div className="absolute inset-0 border-8 rounded-lg" style={{ borderColor: 'rgb(124, 58, 237)' }}></div>

            {/* Content Container */}
            <div className="relative z-10 flex h-full p-6" dir={isRtl ? "rtl" : "ltr"}>
                {/* Left Side - Event Info */}
                <div className="flex-1 flex flex-col justify-between border-r pr-6">
                    {/* Header with logo */}
                    <div className="mb-4">
                        <div className="flex items-center">
                            <div className="text-white p-2 rounded-lg" style={{ backgroundColor: 'rgb(124, 58, 237)' }}>
                                <Ticket className="h-6 w-6" />
                            </div>
                            <h1 className="ml-2 text-2xl font-bold text-gray-900">Bookly</h1>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{t("bookings.ticketId")}: {booking.id}</div>
                    </div>

                    {/* Event Details */}
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            {isRtl && booking.event?.titleAr ? booking.event.titleAr : booking.event?.title || t("bookings.unknownEvent")}
                        </h2>

                        <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" style={{ color: 'rgb(124, 58, 237)' }} />
                                <span>{formatDate(booking.event?.startDate)}</span>
                            </div>

                            <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" style={{ color: 'rgb(124, 58, 237)' }} />
                                <span>{formatTime(booking.event?.startDate)}</span>
                            </div>

                            {booking.event?.venue && (
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2" style={{ color: 'rgb(124, 58, 237)' }} />
                                    <div>
                                        <div>{isRtl && booking.event.venue.nameAr ? booking.event.venue.nameAr : booking.event.venue.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {booking.event.venue.address}
                                            {booking.event.venue.city && `, ${booking.event.venue.city}`}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ticket Info */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-gray-700">{t("bookings.quantity")}:</div>
                            <div className="font-medium text-gray-900">
                                {booking.quantity} {booking.quantity === 1 ? t("bookings.ticket") : t("bookings.tickets")}
                            </div>
                        </div>

                        {booking.totalPrice > 0 && (
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm text-gray-700">{t("bookings.totalAmount")}:</div>
                                <div className="font-medium text-gray-900">
                                    {booking.totalPrice} {booking.event?.currency || "USD"}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center mt-4">
                            <CheckCircle className="h-5 w-5 mr-2" style={{ color: 'rgb(22, 163, 74)' }} />
                            <div className="text-sm font-medium text-green-600">{t("bookings.statusOptions.confirmed")}</div>
                        </div>
                    </div>
                </div>

                {/* Right Side - QR Code */}
                <div className="w-56 flex flex-col items-center justify-center pl-6">
                    <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-sm">
                        <QRCodeSVG
                            value={`EVENT:${booking.eventId}|BOOKING:${booking.id}|QTY:${booking.quantity}`}
                            size={160}
                            level="H"
                            includeMargin={true}
                        />
                    </div>
                    <div className="mt-3 text-center">
                        <div className="text-sm font-medium text-gray-900">{t("bookings.scanQRCode")}</div>
                        <div className="text-xs text-gray-500">{t("bookings.presentAtEntry")}</div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 text-white text-xs py-1 px-6 text-center"
                style={{ backgroundColor: 'rgb(124, 58, 237)' }}>
                {t("bookings.ticketDownloadDate")}: {format(new Date(), "MMMM dd, yyyy • h:mm a")}
            </div>
        </div>
    );
});

EventTicket.displayName = "EventTicket";


export const useTicketDownload = (t: { (key: string, params?: Record<string, string>): string; (arg0: string): string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | ((props: ToastContentProps<unknown>) => React.ReactNode) | null | undefined; }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    type Booking = {
        id: string;
        eventId: string;
        quantity: number;
        totalPrice: number;
        event: {
            title?: string;
            titleAr?: string;
            startDate?: string | number | Date;
            currency?: string;
            venue?: {
                name?: string;
                nameAr?: string;
                address?: string;
                city?: string;
            };
        };
    };


    const fixSvgAndColorFormats = (container: HTMLElement) => {

        const svgs = container.querySelectorAll('svg');
        svgs.forEach(svg => {
            const bbox = svg.getBBox();
            svg.setAttribute('width', bbox.width.toString());
            svg.setAttribute('height', bbox.height.toString());
            svg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
        });


        const elementsWithStyle = container.querySelectorAll('*');
        elementsWithStyle.forEach(el => {
            const element = el as HTMLElement;
            if (!element.style) return;


            if (element.classList.contains('bg-purple-600')) {
                element.style.backgroundColor = 'rgb(124, 58, 237)';
            }
            if (element.classList.contains('text-purple-600')) {
                element.style.color = 'rgb(124, 58, 237)';
            }
            if (element.classList.contains('text-green-600')) {
                element.style.color = 'rgb(22, 163, 74)';
            }
            if (element.classList.contains('border-purple-600')) {
                element.style.borderColor = 'rgb(124, 58, 237)';
            }


        });
    };


    const generateSimplePDF = (booking: Booking, locale: string) => {
        try {
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a4",
            });


            const isRtl = locale === "ar";
            const eventName = isRtl && booking.event.titleAr ?
                booking.event.titleAr :
                booking.event.title || "Unknown Event";


            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(24);
            pdf.text("BOOKLY TICKET", 20, 20);

            pdf.setFontSize(18);
            pdf.text(eventName, 20, 35);

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(12);
            pdf.text(`Booking ID: ${booking.id}`, 20, 50);
            pdf.text(`Quantity: ${booking.quantity}`, 20, 60);

            if (booking.event.startDate) {
                const date = new Date(booking.event.startDate);
                pdf.text(`Date: ${date.toLocaleDateString()}`, 20, 70);
                pdf.text(`Time: ${date.toLocaleTimeString()}`, 20, 80);
            }

            if (booking.event.venue) {
                const venueName = isRtl && booking.event.venue.nameAr ?
                    booking.event.venue.nameAr :
                    booking.event.venue.name || "Unknown Venue";
                pdf.text(`Venue: ${venueName}`, 20, 90);
                pdf.text(`Address: ${booking.event.venue.address || ''}`, 20, 100);
            }


            const filename = `ticket_simple_${booking.id.slice(0, 8)}.pdf`;
            pdf.save(filename);
            return true;
        } catch (error) {
            return false;
        }
    };

    const generateTicketPDF = async (booking: Booking, locale: string, theme: string): Promise<void> => {
        if (!booking || !booking.event) {
            toast.error(t("bookings.ticketGenerationError"));
            return;
        }

        setIsGenerating(true);
        toast.info(t("bookings.generatingTicket"), { autoClose: false, toastId: "generating-ticket" });

        try {

            const tempDiv = document.createElement("div");
            tempDiv.style.position = "absolute";
            tempDiv.style.left = "-9999px";
            tempDiv.style.top = "-9999px";
            document.body.appendChild(tempDiv);


            const ticketRef = React.createRef<HTMLDivElement>();
            const ticketComponent = (
                <EventTicket
                    ref={ticketRef}
                    booking={booking}
                    t={t}
                    locale={locale}
                    theme={theme}
                />
            );


            const ReactDOM = await import("react-dom/client");
            const root = ReactDOM.createRoot(tempDiv);
            root.render(ticketComponent);


            await new Promise(resolve => {

                requestAnimationFrame(() => {

                    setTimeout(resolve, 1000);
                });
            });


            if (!ticketRef.current) {
                throw new Error("Ticket element not found for PDF generation.");
            }


            fixSvgAndColorFormats(ticketRef.current);

            const canvas = await html2canvas(ticketRef.current, {
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
            });

            const imgData = canvas.toDataURL("image/png");


            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a4",
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();


            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = (pdfHeight - imgHeight * ratio) / 2;

            pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);


            const eventName = locale === "ar" && booking.event.titleAr ?
                booking.event.titleAr :
                booking.event.title || "event";
            const sanitizedEventName = eventName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
            const filename = `ticket_${sanitizedEventName}_${booking.id.slice(0, 8)}.pdf`;


            pdf.save(filename);


            root.unmount();
            document.body.removeChild(tempDiv);
            toast.dismiss("generating-ticket");
            toast.success(t("bookings.ticketDownloaded"));
        } catch (error) {
            toast.dismiss("generating-ticket");


            if (generateSimplePDF(booking, locale)) {
                toast.success(t("bookings.ticketDownloaded"));
            } else {
                toast.error(t("bookings.ticketGenerationError"));
            }
        } finally {
            setIsGenerating(false);
        }
    };

    return { generateTicketPDF, isGenerating };
};


export const TicketDownloadButton: React.FC<{
    booking: {
        id: string;
        eventId: string;
        quantity: number;
        totalPrice: number;
        event: {
            title?: string;
            titleAr?: string;
            startDate?: string | number | Date;
            currency?: string;
            venue?: {
                name?: string;
                nameAr?: string;
                address?: string;
                city?: string;
            };
        };
    };
    t: any;
    locale: string;
    theme: string;
}> = ({ booking, t, locale, theme }) => {
    const { generateTicketPDF, isGenerating } = useTicketDownload(t);

    return (
        <button
            onClick={() => generateTicketPDF(booking, locale, theme)}
            disabled={isGenerating}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-wait`}
        >
            {isGenerating ? (
                <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t("bookings.generatingTicket")}
                </span>
            ) : (
                <>
                    <Download className="h-4 w-4 mr-2" />
                    {t("bookings.downloadTicket")}
                </>
            )}
        </button>
    );
};