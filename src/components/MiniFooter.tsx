import { useTranslation } from "@/hooks/useTranslation";

const MiniFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#4B4A4A] border-t border-[#5B5A5A]">
      <div className="container mx-auto px-6 py-6">
        <div className="text-center space-y-4">
          <p className="text-sm text-white">
            © {new Date().getFullYear()} {t.footer.copyright}
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#" className="text-white hover:text-white/80 transition-colors">
              {t.footer.terms}
            </a>
            <span className="text-white/50">•</span>
            <a href="#" className="text-white hover:text-white/80 transition-colors">
              {t.footer.imprint}
            </a>
            <span className="text-white/50">•</span>
            <a href="#" className="text-white hover:text-white/80 transition-colors">
              {t.footer.privacy}
            </a>
            <span className="text-white/50">•</span>
            <a href="#" className="text-white hover:text-white/80 transition-colors">
              {t.footer.compliance}
            </a>
            <span className="text-white/50">•</span>
            <a href="#" className="text-white hover:text-white/80 transition-colors">
              {t.footer.carbon}
            </a>
            <span className="text-white/50">•</span>
            <a href="#" className="text-white hover:text-white/80 transition-colors">
              {t.footer.esg}
            </a>
            <span className="text-white/50">•</span>
            <a href="#" className="text-white hover:text-white/80 transition-colors">
              {t.footer.disposal}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MiniFooter;
