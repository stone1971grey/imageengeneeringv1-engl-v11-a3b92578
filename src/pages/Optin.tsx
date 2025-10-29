import { useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Optin = () => {
  const location = useLocation();
  const firstName = location.state?.firstName || "Firstname";
  const lastName = location.state?.lastName || "Lastname";

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FB]">
      <Navigation />
      
      <div className="flex-1 pt-32 pb-16">
        <div className="container mx-auto px-6 max-w-[600px]">
          <div style={{
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {/* Header */}
                <tr>
                  <td style={{
                    backgroundColor: '#1a1a1a',
                    padding: '40px 30px',
                    textAlign: 'center'
                  }}>
                    <h1 style={{
                      color: '#ffffff',
                      fontSize: '28px',
                      fontWeight: 'bold',
                      margin: '0',
                      lineHeight: '1.3'
                    }}>
                      Bestätigen Sie Ihre E-Mail-Adresse
                    </h1>
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={{ padding: '40px 30px' }}>
                    <p style={{
                      color: '#333333',
                      fontSize: '16px',
                      lineHeight: '1.6',
                      margin: '0 0 20px 0'
                    }}>
                      Hallo {firstName} {lastName},
                    </p>

                    <p style={{
                      color: '#333333',
                      fontSize: '16px',
                      lineHeight: '1.6',
                      margin: '0 0 20px 0'
                    }}>
                      vielen Dank für Ihr Interesse an unseren Testcharts und Lösungen. Um Ihnen die gewünschten Informationen zusenden zu können, bitten wir Sie, Ihre E-Mail-Adresse zu bestätigen.
                    </p>

                    <p style={{
                      color: '#333333',
                      fontSize: '16px',
                      lineHeight: '1.6',
                      margin: '0 0 30px 0'
                    }}>
                      Bitte klicken Sie auf den folgenden Button, um Ihre Anmeldung abzuschließen:
                    </p>

                    {/* CTA Button */}
                    <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%', marginBottom: '30px' }}>
                      <tbody>
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <a href="https://preview--imageengeneeringv1-engl-v11.lovable.app/confirm-contact" style={{
                              display: 'inline-block',
                              backgroundColor: '#f5743a',
                              color: '#ffffff',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              textDecoration: 'none',
                              padding: '14px 40px',
                              borderRadius: '6px',
                              textAlign: 'center'
                            }}>
                              E-Mail-Adresse bestätigen
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <p style={{
                      color: '#666666',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      margin: '0 0 20px 0'
                    }}>
                      Sollte der Button nicht funktionieren, können Sie auch den folgenden Link in Ihren Browser kopieren:
                    </p>

                    <p style={{
                      color: '#3D7BA2',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      margin: '0 0 30px 0',
                      wordBreak: 'break-all'
                    }}>
                      https://preview--imageengeneeringv1-engl-v11.lovable.app/confirm-contact
                    </p>

                    <p style={{
                      color: '#666666',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      margin: '0'
                    }}>
                      Diese Bestätigung hilft uns, die Sicherheit Ihrer Daten zu gewährleisten und sicherzustellen, dass Sie alle wichtigen Updates erhalten.
                    </p>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{
                    backgroundColor: '#f5f5f5',
                    padding: '30px',
                    textAlign: 'center',
                    borderTop: '1px solid #e0e0e0'
                  }}>
                    <p style={{
                      color: '#666666',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      margin: '0 0 15px 0'
                    }}>
                      Bei Fragen stehen wir Ihnen gerne zur Verfügung.
                    </p>

                    <p style={{
                      color: '#333333',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      margin: '0 0 5px 0',
                      fontWeight: 'bold'
                    }}>
                      Image Engineering GmbH & Co. KG
                    </p>

                    <p style={{
                      color: '#666666',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      margin: '0'
                    }}>
                      Donaustraße 152 • 12043 Berlin • Deutschland<br />
                      Tel: +49 30 120 84 49 70<br />
                      E-Mail: info@image-engineering.de
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Optin;
