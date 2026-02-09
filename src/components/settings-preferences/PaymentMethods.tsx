import type { SavedCard, SavedBankAccount } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import {
  useSavedCards,
  useRemoveCard,
  useSetDefaultCard,
  useSavedBankAccounts,
  useAddBankAccount,
  useRemoveBankAccount,
} from '@/hooks/use-settings-preferences'
import { toast } from 'sonner'
import { CreditCard, Building2, Plus, Trash2, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const isSeller = (role: string) => role === 'seller' || role === 'admin'

export function PaymentMethods() {
  const { user } = useAuth()
  const [addBankOpen, setAddBankOpen] = useState(false)
  const [bankName, setBankName] = useState('')
  const [bankLast4, setBankLast4] = useState('')

  const { data: cards, isLoading: cardsLoading } = useSavedCards()
  const { data: banks, isLoading: banksLoading } = useSavedBankAccounts()
  const removeCardMutation = useRemoveCard()
  const setDefaultCardMutation = useSetDefaultCard()
  const addBankMutation = useAddBankAccount()
  const removeBankMutation = useRemoveBankAccount()

  const handleAddBank = () => {
    if (!bankName.trim() || bankLast4.length !== 4) {
      toast.error('Enter bank name and last 4 digits')
      return
    }
    addBankMutation.mutate(
      { bankName: bankName.trim(), last4: bankLast4 },
      {
        onSuccess: () => {
          toast.success('Bank account added')
          setAddBankOpen(false)
          setBankName('')
          setBankLast4('')
        },
        onError: () => toast.error('Failed to add bank account'),
      }
    )
  }

  if (cardsLoading) {
    return (
      <Card className="rounded-2xl border border-border">
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="rounded-2xl border border-border shadow-card transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment methods
          </CardTitle>
          <CardDescription>
            Saved cards and, for sellers, bank accounts for payouts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h4 className="mb-3 text-sm font-medium text-muted-foreground">
              Saved cards
            </h4>
            {!cards?.length ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
                <CreditCard className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No saved cards. Add one at checkout.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {cards.map((card: SavedCard) => (
                  <li
                    key={card.id}
                    className={cn(
                      'flex items-center justify-between rounded-xl border border-border p-4 transition-all duration-200',
                      'hover:border-primary/30 hover:shadow-card'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {card.brand} •••• {card.last4}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expires {card.expMonth}/{card.expYear}
                          {card.isDefault && (
                            <span className="ml-2 text-primary">Default</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!card.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={setDefaultCardMutation.isPending}
                          onClick={() =>
                            setDefaultCardMutation.mutate(card.id, {
                              onSuccess: () =>
                                toast.success('Default card updated'),
                            })
                          }
                        >
                          Set default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        disabled={removeCardMutation.isPending}
                        onClick={() =>
                          removeCardMutation.mutate(card.id, {
                            onSuccess: () => toast.success('Card removed'),
                          })
                        }
                        aria-label="Remove card"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {user && isSeller(user.role) && (
            <section>
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                Bank accounts (payouts)
              </h4>
              {banksLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : !banks?.length ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
                  <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No bank accounts. Add one for payouts.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3 transition-transform duration-200 hover:scale-[1.02]"
                    onClick={() => setAddBankOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add bank account
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {banks.map((bank: SavedBankAccount) => (
                    <li
                      key={bank.id}
                      className={cn(
                        'flex items-center justify-between rounded-xl border border-border p-4 transition-all duration-200',
                        'hover:border-primary/30 hover:shadow-card'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {bank.bankName} •••• {bank.last4}
                          </p>
                          {bank.isDefault && (
                            <span className="text-xs text-primary">Default</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        disabled={removeBankMutation.isPending}
                        onClick={() =>
                          removeBankMutation.mutate(bank.id, {
                            onSuccess: () => toast.success('Bank account removed'),
                          })
                        }
                        aria-label="Remove bank account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full transition-transform duration-200 hover:scale-[1.01]"
                    onClick={() => setAddBankOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add bank account
                  </Button>
                </ul>
              )}
            </section>
          )}
        </CardContent>
      </Card>

      <Dialog open={addBankOpen} onOpenChange={setAddBankOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add bank account</DialogTitle>
            <DialogDescription>
              Enter your bank details for receiving payouts. Only last 4 digits are stored.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank name</Label>
              <Input
                id="bankName"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Chase Bank"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankLast4">Last 4 digits of account</Label>
              <Input
                id="bankLast4"
                value={bankLast4}
                onChange={(e) => setBankLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="1234"
                maxLength={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddBankOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddBank}
              disabled={addBankMutation.isPending || !bankName.trim() || bankLast4.length !== 4}
            >
              {addBankMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-pulse" />
              ) : (
                'Add'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
