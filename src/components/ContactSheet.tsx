import { Phone, X } from "lucide-react";

interface ContactSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function ContactSheet({ open, onClose }: ContactSheetProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[90] bg-card border-t border-foreground/10 rounded-t-3xl px-6 pt-5 pb-10 transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-foreground/20 rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-cairo font-bold text-lg text-foreground">تواصل معنا</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-foreground/60" />
          </button>
        </div>

        <p className="font-tajawal text-foreground/50 text-sm text-center mb-6">
          للاستفسارات والطلبات، تواصل معنا مباشرة
        </p>

        {/* Contact buttons */}
        <div className="flex flex-col gap-3">
          {/* WhatsApp */}
          <a
            href="https://wa.me/201069577622"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center justify-center gap-3 h-13 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] font-cairo font-semibold text-base transition-all hover:bg-[#25D366]/25"
          >
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            واتساب — 01069577622
          </a>

          {/* Phone */}
          <a
            href="tel:01069577622"
            onClick={onClose}
            className="flex items-center justify-center gap-3 h-13 rounded-2xl bg-foreground/5 border border-foreground/10 text-foreground/80 font-cairo font-semibold text-base transition-all hover:bg-foreground/10"
          >
            <Phone className="w-5 h-5 shrink-0" />
            اتصل — 01069577622
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/share/1KWimTQzc8/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center justify-center gap-3 h-13 rounded-2xl bg-[#1877F2]/10 border border-[#1877F2]/25 text-[#1877F2] font-cairo font-semibold text-base transition-all hover:bg-[#1877F2]/20"
          >
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
            فيسبوك — Magic Mirror
          </a>
        </div>
      </div>
    </>
  );
}
