import React, { useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { FiCopy, FiExternalLink, FiDownload } from "react-icons/fi";

export default function QrMenuSettings() {
  const { user } = useAuth();
  const svgRef = useRef(null);

  if (!user) return <div className="p-4 text-text-muted">Loading user data...</div>;

  const publicLink = `${window.location.origin}/store/${user.uid}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicLink);
    alert("Link copied to clipboard!");
  };

  const downloadQR = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      // Add a little padding and white background
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "BiteORO-QR-Menu.png";
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-surface dark:bg-gray-800 p-6 rounded-2xl shadow-card border border-border">
        <h2 className="text-2xl font-bold font-display text-text-primary dark:text-white mb-2">QR Menu Settings</h2>
        <p className="text-text-muted text-sm mb-6">
          This is your public storefront link. Customers can use this link or scan the QR code to view your menu and place orders without creating an account.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Link Section */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-text-muted font-bold block mb-1.5 uppercase tracking-wider">Your Public Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicLink}
                  className="input flex-1 text-sm bg-surface-secondary text-brand-600 font-medium"
                />
                <button
                  onClick={copyToClipboard}
                  className="btn-icon p-2.5 bg-surface-tertiary hover:bg-brand-50 hover:text-brand-600 border border-border rounded-xl transition-colors"
                  title="Copy link"
                >
                  <FiCopy />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={publicLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                <span>Open Storefront</span>
                <FiExternalLink />
              </a>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center space-y-4 pt-4 md:pt-0 md:border-l border-border-light">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-border inline-block">
              <QRCodeSVG
                value={publicLink}
                size={180}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"}
                includeMargin={false}
                ref={svgRef}
              />
            </div>
            
            <button
              onClick={downloadQR}
              className="btn-ghost flex items-center gap-2 text-sm font-semibold hover:text-brand-600 transition-colors"
            >
              <FiDownload />
              <span>Download QR Code</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
