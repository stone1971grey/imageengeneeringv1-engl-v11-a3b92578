import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Minus, ShoppingCart, Send } from "lucide-react";
import { Link } from "react-router-dom";

interface CartItem {
  id: string;
  title: string;
  sku: string;
  image: string;
  price: number | null;
  quantity: number;
  variants: Record<string, string>;
  priceMode: 'fixed' | 'from' | 'rfq';
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      title: 'ISO 12233 SFR Testchart',
      sku: 'IE-SFR-001',
      image: '/src/assets/chart-case.png',
      price: 490,
      quantity: 2,
      variants: { 'Größe': 'A3', 'Material': 'Film' },
      priceMode: 'fixed'
    },
    {
      id: '3',
      title: 'Siemens Star Precision Chart',
      sku: 'IE-SIE-003',
      image: '/src/assets/chart-case.png',
      price: null,
      quantity: 1,
      variants: { 'Durchmesser': '100mm', 'Material': 'Glas' },
      priceMode: 'rfq'
    }
  ]);

  const [customerInfo, setCustomerInfo] = useState({
    company: '',
    name: '',
    email: '',
    country: '',
    notes: ''
  });

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.price ? item.price * item.quantity : 0);
  }, 0);

  const hasRfqItems = cartItems.some(item => item.priceMode === 'rfq');
  const hasPricedItems = cartItems.some(item => item.price !== null);

  const handleSubmitQuote = () => {
    // Here you would send the quote request
    console.log('Quote request:', { cartItems, customerInfo });
    alert('Anfrage wurde erfolgreich gesendet!');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <AnnouncementBanner 
          message="Kostenloser Versand ab 500€ Bestellwert"
          ctaText="Mehr erfahren"
          ctaLink="#"
          icon="calendar"
        />
        
        <div className="container mx-auto px-6 py-16">
          <div className="text-center max-w-md mx-auto">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-4">Ihr Warenkorb ist leer</h1>
            <p className="text-muted-foreground mb-8">
              Entdecken Sie unsere große Auswahl an Testcharts
            </p>
            <Button asChild>
              <Link to="/products/charts">
                Testcharts entdecken
              </Link>
            </Button>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AnnouncementBanner 
        message="Kostenloser Versand ab 500€ Bestellwert"
        ctaText="Mehr erfahren"
        ctaLink="#"
        icon="calendar"
      />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Warenkorb</h1>
          <p className="text-muted-foreground">
            {cartItems.length} {cartItems.length === 1 ? 'Artikel' : 'Artikel'} in Ihrem Warenkorb
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.sku}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Variants */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Object.entries(item.variants).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {value}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          {item.priceMode === 'rfq' ? (
                            <span className="font-semibold text-muted-foreground">
                              Auf Anfrage
                            </span>
                          ) : item.price ? (
                            <span className="font-semibold text-lg text-primary">
                              {(item.price * item.quantity).toLocaleString('de-DE')}€
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary & Quote Form */}
          <div className="space-y-6">
            {/* Price Summary */}
            {hasPricedItems && (
              <Card>
                <CardHeader>
                  <CardTitle>Preisübersicht</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Zwischensumme</span>
                    <span>{subtotal.toLocaleString('de-DE')}€</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Versand</span>
                    <span>{subtotal >= 500 ? 'Kostenlos' : 'Wird berechnet'}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>MwSt. (19%)</span>
                    <span>Wird ausgewiesen</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Summe (Netto)</span>
                    <span className="text-primary">
                      {hasRfqItems ? `${subtotal.toLocaleString('de-DE')}€ + Anfrage` : `${subtotal.toLocaleString('de-DE')}€`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quote Request Form */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {hasRfqItems ? 'Angebot anfragen' : 'Bestellung anfragen'}
                </CardTitle>
                <CardDescription>
                  {hasRfqItems 
                    ? 'Da Ihr Warenkorb Artikel "auf Anfrage" enthält, erstellen wir Ihnen ein individuelles Angebot.'
                    : 'Senden Sie uns Ihre Bestellanfrage und wir melden uns schnellstmöglich bei Ihnen.'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Firmenname *</Label>
                    <Input
                      id="company"
                      value={customerInfo.company}
                      onChange={(e) => setCustomerInfo({...customerInfo, company: e.target.value})}
                      placeholder="Ihre Firma"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Ansprechpartner *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      placeholder="Ihr Name"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">E-Mail-Adresse *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    placeholder="ihre@email.de"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="country">Land</Label>
                  <Select
                    value={customerInfo.country}
                    onValueChange={(value) => setCustomerInfo({...customerInfo, country: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Land auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">Deutschland</SelectItem>
                      <SelectItem value="at">Österreich</SelectItem>
                      <SelectItem value="ch">Schweiz</SelectItem>
                      <SelectItem value="us">USA</SelectItem>
                      <SelectItem value="cn">China</SelectItem>
                      <SelectItem value="other">Andere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="notes">Anmerkungen</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                    placeholder="Besondere Anforderungen, Liefertermin, etc."
                    rows={3}
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleSubmitQuote}
                  disabled={!customerInfo.company || !customerInfo.name || !customerInfo.email}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {hasRfqItems ? 'Angebot anfragen' : 'Bestellung anfragen'}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  * Pflichtfelder. Ihre Daten werden verschlüsselt übertragen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;