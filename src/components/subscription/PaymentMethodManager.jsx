import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert, { AlertDescription } from '@/components/ui/Alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  CreditCard,
  Plus,
  Settings,
  Trash2,
  AlertCircle,
  CheckCircle,
  Shield,
  Calendar,
  DollarSign
} from 'lucide-react';

const PaymentMethodManager = ({ subscription, onUpdate }) => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
      status: 'active'
    }
  ]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    name: ''
  });

  const handleAddPaymentMethod = async () => {
    setLoading(true);
    try {
      // API call to add payment method
      console.log('Adding payment method:', newCard);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMethod = {
        id: Date.now().toString(),
        type: 'card',
        brand: 'visa',
        last4: newCard.cardNumber.slice(-4),
        expiryMonth: parseInt(newCard.expiryMonth),
        expiryYear: parseInt(newCard.expiryYear),
        isDefault: paymentMethods.length === 0,
        status: 'active'
      };
      
      setPaymentMethods([...paymentMethods, newMethod]);
      setShowAddCard(false);
      setNewCard({ cardNumber: '', expiryMonth: '', expiryYear: '', cvc: '', name: '' });
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error adding payment method:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      setPaymentMethods(methods => 
        methods.map(method => ({
          ...method,
          isDefault: method.id === methodId
        }))
      );
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  };

  const handleDeletePaymentMethod = async (methodId) => {
    try {
      setPaymentMethods(methods => methods.filter(method => method.id !== methodId));
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  const getBrandIcon = (brand) => {
    // Return appropriate icon based on card brand
    return <CreditCard className="h-6 w-6" />;
  };

  const formatCardNumber = (value) => {
    // Format card number with spaces
    return value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').match(/.{1,4}/g)?.join(' ') || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
          <p className="text-sm text-gray-600">Manage your payment methods and billing preferences</p>
        </div>
        
        <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formatCardNumber(newCard.cardNumber)}
                  onChange={(e) => setNewCard({
                    ...newCard,
                    cardNumber: e.target.value.replace(/\s+/g, '')
                  })}
                  maxLength="19"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryMonth">Expiry Month</Label>
                  <Input
                    id="expiryMonth"
                    placeholder="MM"
                    value={newCard.expiryMonth}
                    onChange={(e) => setNewCard({
                      ...newCard,
                      expiryMonth: e.target.value.replace(/\D/g, '').slice(0, 2)
                    })}
                    maxLength="2"
                  />
                </div>
                <div>
                  <Label htmlFor="expiryYear">Expiry Year</Label>
                  <Input
                    id="expiryYear"
                    placeholder="YYYY"
                    value={newCard.expiryYear}
                    onChange={(e) => setNewCard({
                      ...newCard,
                      expiryYear: e.target.value.replace(/\D/g, '').slice(0, 4)
                    })}
                    maxLength="4"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={newCard.cvc}
                  onChange={(e) => setNewCard({
                    ...newCard,
                    cvc: e.target.value.replace(/\D/g, '').slice(0, 4)
                  })}
                  maxLength="4"
                />
              </div>
              
              <div>
                <Label htmlFor="name">Cardholder Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={newCard.name}
                  onChange={(e) => setNewCard({
                    ...newCard,
                    name: e.target.value
                  })}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleAddPaymentMethod}
                  disabled={loading || !newCard.cardNumber || !newCard.expiryMonth || !newCard.expiryYear || !newCard.cvc}
                  className="flex-1"
                >
                  {loading ? 'Adding...' : 'Add Card'}
                </Button>
                <Button variant="outline" onClick={() => setShowAddCard(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payment Methods List */}
      {paymentMethods.length > 0 ? (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className={method.isDefault ? 'ring-2 ring-blue-200' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getBrandIcon(method.brand)}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">•••• •••• •••• {method.last4}</p>
                        {method.isDefault && (
                          <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {method.brand.toUpperCase()}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {method.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePaymentMethod(method.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Methods</h3>
            <p className="text-gray-600 mb-4">Add a payment method to ensure uninterrupted service</p>
            <Button onClick={() => setShowAddCard(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Payment Method
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Secure Processing:</strong> All payment information is encrypted and processed securely. 
          We never store your complete card details on our servers.
        </AlertDescription>
      </Alert>

      {/* Billing Information */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Billing Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Next Charge Amount</p>
                <p className="text-lg font-semibold">
                  ${subscription?.plan?.price || subscription?.billing_info?.next_billing_amount || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Charge Date</p>
                <p className="text-lg font-semibold">
                  {subscription?.next_payment_date ? 
                    new Date(subscription.next_payment_date).toLocaleDateString() : 
                    'N/A'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Billing Cycle</p>
                <p className="text-lg font-semibold capitalize">
                  {subscription?.plan?.billing_cycle || subscription?.billing_info?.billing_cycle || 'Monthly'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Auto Renewal</p>
                <p className="text-lg font-semibold">
                  {subscription?.auto_renew || subscription?.billing_info?.auto_renew ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentMethodManager;
