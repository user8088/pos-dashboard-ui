import React from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  Select,
  Button,
  Image,
  Grid,
  GridItem,
  VStack,
  HStack,
  useColorModeValue,
  useToast,
  Spinner,
  IconButton,
  Badge,
  Checkbox,
  Divider,
  SimpleGrid,
} from '@chakra-ui/react';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import { stockService } from 'services/stockService';
import { customerService } from 'services/customerService';
import { invoiceService } from 'services/invoiceService';
import { accountService } from 'services/accountService';
import { reservationService } from 'services/reservationService';
import { useAuth } from 'contexts/AuthContext';
import placeholder from 'assets/img/avatars/placeholder.png';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

export default function POS() {
  const textColor = useColorModeValue('gray.700', 'white');
  const toast = useToast();
  const { user } = useAuth();
  const [catalogSearch, setCatalogSearch] = React.useState('');
  const [items, setItems] = React.useState([]);
  const [originalStock, setOriginalStock] = React.useState({}); // Track original stock & reservation info: {itemId: {available,onHand,reserved}}
  const [loading, setLoading] = React.useState(false);
  const [customers, setCustomers] = React.useState([]);
  const [customerId, setCustomerId] = React.useState('');
  const [paymentMode, setPaymentMode] = React.useState('cash');
  const [discountPercent, setDiscountPercent] = React.useState('');
  const [discountAmount, setDiscountAmount] = React.useState('');
  const [cart, setCart] = React.useState([]); // {id, name, price, basePrice, hiddenCost, qty, unitType, primaryUnit, secondaryUnit, secondaryPerPrimary}
  const [categories, setCategories] = React.useState([]);
  const [categoryId, setCategoryId] = React.useState('');
  const [splitPayments, setSplitPayments] = React.useState({
    cash: { amount: '', accountId: '' },
    online: { amount: '', accountId: '' },
  });
  const [paidAmount, setPaidAmount] = React.useState('');
  const [paymentAs, setPaymentAs] = React.useState('payment');
  const [dueDate, setDueDate] = React.useState('');
  const [customerProfile, setCustomerProfile] = React.useState(null);
  const [accounts, setAccounts] = React.useState([]);
  const [depositAccountId, setDepositAccountId] = React.useState('');
  const [reservationMode, setReservationMode] = React.useState('sale'); // sale | reserve
  const [customerReservations, setCustomerReservations] = React.useState([]);
  const [activeReservation, setActiveReservation] = React.useState(null);
  const [reservationBannerDismissed, setReservationBannerDismissed] = React.useState(false);
  const [reserveNote, setReserveNote] = React.useState('');
  const [reservePickupDate, setReservePickupDate] = React.useState('');
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);
  const [lastInvoiceMeta, setLastInvoiceMeta] = React.useState(null);
  const [lastReservationMeta, setLastReservationMeta] = React.useState(null);
  const [printLoading, setPrintLoading] = React.useState(false);
  const [reservationPrintLoading, setReservationPrintLoading] = React.useState(false);
  const [reservationActionLoading, setReservationActionLoading] = React.useState(false);
  const [reservationActionId, setReservationActionId] = React.useState(null);
  const [customAdvanceAmount, setCustomAdvanceAmount] = React.useState(''); // For manual override of advance usage


  const cashAccounts = React.useMemo(
    () => accounts.filter(acc => {
      const type = (acc?.type || '').toLowerCase();
      return type === 'cash' || (type === 'custom' && acc.name?.toLowerCase().includes('cash'));
    }),
    [accounts]
  );
  const onlineAccounts = React.useMemo(
    () => accounts.filter(acc => {
      const type = (acc?.type || '').toLowerCase();
      return type === 'bank' || (type === 'custom' && !acc.name?.toLowerCase().includes('cash'));
    }),
    [accounts]
  );

  // Helper to format account display name
  const formatAccountName = React.useCallback((acc) => {
    const type = (acc?.type || '').toLowerCase();
    const typeLabel = type === 'cash' ? 'Cash' : type === 'bank' ? 'Bank' : 'Custom';
    const balance = Number(acc.balance || 0).toFixed(2);
    return `${acc.name} ${acc.code ? `(${acc.code})` : ''} [${typeLabel}] - PKR ${balance}`;
  }, []);

  const extractInvoiceMeta = React.useCallback((response) => {
    const candidates = [
      response,
      response?.data,
      response?.data?.invoice,
      response?.invoice,
      response?.invoice?.data,
    ];
    for (const entry of candidates) {
      if (!entry || typeof entry !== 'object') continue;
      const id = entry.id
        ?? entry.invoice_id
        ?? entry.data?.id
        ?? entry.invoice?.id;
      if (!id) continue;
      const number =
        entry.invoice_number
        ?? entry.number
        ?? entry.reference
        ?? entry.code
        ?? entry.invoice_reference
        ?? `#${id}`;
      return { id, number };
    }
    return null;
  }, []);

  const extractReservationMeta = React.useCallback((response) => {
    const candidates = [
      response,
      response?.data,
      response?.reservation,
      response?.reservation?.data,
    ];
    for (const entry of candidates) {
      if (!entry || typeof entry !== 'object') continue;
      const id = entry.id
        ?? entry.reservation_id
        ?? entry.data?.id;
      if (!id) continue;
      const reference =
        entry.reference
        ?? entry.code
        ?? entry.reservation_reference
        ?? `RES-${id}`;
      return { id, reference };
    }
    return null;
  }, []);

  const presentBlobForPrint = React.useCallback((blob) => {
    return new Promise((resolve, reject) => {
      const blobUrl = window.URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-10000px';
      iframe.style.left = '-10000px';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);

      const cleanup = () => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
        window.URL.revokeObjectURL(blobUrl);
      };

      const handleAfterPrint = () => {
        clearTimeout(timeout);
        cleanup();
        window.removeEventListener('afterprint', handleAfterPrint);
        iframe.contentWindow?.removeEventListener('afterprint', handleAfterPrint);
        resolve(true);
      };

      const timeout = setTimeout(() => {
        handleAfterPrint();
      }, 60000);

      iframe.onload = () => {
        try {
          window.addEventListener('afterprint', handleAfterPrint);
          iframe.contentWindow?.addEventListener('afterprint', handleAfterPrint);
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (error) {
          clearTimeout(timeout);
          cleanup();
          reject(error);
        }
      };
    });
  }, []);

  const triggerInvoicePrint = React.useCallback(async (invoiceId, { silent = false } = {}) => {
    if (!invoiceId) return;
    if (!silent) {
      setPrintLoading(true);
    }
    try {
      const blob = await invoiceService.fetchInvoicePdf(invoiceId);
      await presentBlobForPrint(blob);
      if (!silent) {
        toast({
          title: 'Invoice ready to print',
          description: 'Your browser print dialog should appear shortly.',
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (error) {
      if (silent) {
        console.warn('Auto print failed', error);
      } else {
        toast({
          title: 'Unable to print invoice',
          description: error?.message || 'Failed to open print preview.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      if (!silent) {
        setPrintLoading(false);
      }
    }
  }, [presentBlobForPrint, toast]);

  const triggerReservationReceiptPrint = React.useCallback(async (reservationId, { silent = false } = {}) => {
    if (!reservationId) return;
    if (!silent) {
      setReservationPrintLoading(true);
    }
    try {
      const blob = await reservationService.fetchReservationReceipt(reservationId);
      await presentBlobForPrint(blob);
      if (!silent) {
        toast({
          title: 'Reservation receipt ready',
          description: 'Printing reservation receipt.',
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (error) {
      if (silent) {
        console.warn('Reservation receipt print failed', error);
      } else {
        toast({
          title: 'Unable to print reservation receipt',
          description: error?.message || 'Failed to download reservation receipt.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      if (!silent) {
        setReservationPrintLoading(false);
      }
    }
  }, [presentBlobForPrint, toast]);

  const handleSplitPaymentChange = React.useCallback((key, field, value) => {
    setSplitPayments(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  }, []);

  const handlePaymentModeChange = React.useCallback((nextMode) => {
    setPaymentMode(nextMode);
    if (nextMode === 'split') {
      setPaymentAs('payment');
      setPaidAmount('');
    } else {
      // Auto-select appropriate account based on payment mode
      const normalizeType = (acc) => (acc?.type || '').toLowerCase();
      if (nextMode === 'cash') {
        const cashAccount = accounts.find(acc => normalizeType(acc) === 'cash');
        if (cashAccount) {
          setDepositAccountId(String(cashAccount.id));
        }
      } else if (nextMode === 'online') {
        const bankAccount = accounts.find(acc => normalizeType(acc) === 'bank');
        if (bankAccount) {
          setDepositAccountId(String(bankAccount.id));
        }
      }
    }
  }, [accounts]);

  const normalizePaymentMethod = React.useCallback((method, accountId) => {
    const value = (method || '').toLowerCase();
    if (value === 'online') {
      // Backend accepts 'bank' for all online/digital payments
      // Always return 'bank' regardless of account type
      return 'bank';
    }
    // For cash, always return 'cash'
    return 'cash';
  }, []);

  const getBasePrice = React.useCallback((line) => {
    if (!line) return 0;
    if (typeof line.basePrice === 'number' && !Number.isNaN(line.basePrice)) {
      return Number(line.basePrice);
    }
    const catalogItem = items.find(it => it.id === line.id);
    if (catalogItem) {
      return Number(catalogItem.price || 0);
    }
    return Number(line.price || 0);
  }, [items]);

  const loadCatalog = React.useCallback(async () => {
    try {
      setLoading(true);
      const resp = await stockService.listItems({ search: catalogSearch || undefined, product_category_id: categoryId || undefined });
      const raw = resp?.data?.data || resp?.data || resp || [];
      const stockMap = {};
      const itemsList = raw.map(it => {
        const onHandRaw = it.quantity ?? it.stock_quantity ?? it.inventory_quantity ?? it.qty ?? null;
        let onHand = onHandRaw !== null && onHandRaw !== undefined ? Number(onHandRaw) : null;
        if (!Number.isFinite(onHand)) onHand = null;

        let reservedRaw = it.reserved_quantity ?? it.reserved ?? 0;
        let reservedQty = reservedRaw !== null && reservedRaw !== undefined ? Number(reservedRaw) : 0;
        if (!Number.isFinite(reservedQty)) reservedQty = 0;

        const availableField = it.available_quantity ?? it.available ?? null;
        let availableQty = availableField !== null && availableField !== undefined ? Number(availableField) : null;
        if (!Number.isFinite(availableQty)) {
          availableQty = onHand !== null ? onHand - reservedQty : null;
        }
        if (availableQty !== null && availableQty < 0) {
          availableQty = 0;
        }

        stockMap[it.id] = {
          onHand,
          reserved: reservedQty,
          available: availableQty,
        };
        const primaryUnit = it.primaryUnit?.symbol || it.primaryUnit?.name || it.primary_unit?.symbol || it.primary_unit?.name || '';
        const secondaryUnit = it.secondaryUnit?.symbol || it.secondaryUnit?.name || it.secondary_unit?.symbol || it.secondary_unit?.name || '';
        const secondaryPerPrimary = it.secondary_per_primary ? Number(it.secondary_per_primary) : null;
        return {
          id: it.id,
          name: it.name,
          serial_id: it.serial_id || it.serial_number || '',
          price: Number(it.selling_price || 0),
          cost: Number(it.last_purchase_price || 0),
          image: it.image_url || placeholder,
          stock: availableQty,
          stock_on_hand: onHand,
          reserved: reservedQty,
          available: availableQty,
          primaryUnit,
          secondaryUnit,
          secondaryPerPrimary,
        };
      });
      setOriginalStock(prev => ({ ...prev, ...stockMap })); // Merge with existing to preserve reserved stock
      setItems(itemsList);
    } finally { setLoading(false); }
  }, [catalogSearch, categoryId]);

  const loadCustomers = React.useCallback(async () => {
    try {
      const resp = await customerService.list({ per_page: 50 });
      const list = resp?.data?.data || resp?.data || resp || [];
      const filtered = list.filter((customer) => {
        const name = (customer?.name || '').trim().toLowerCase();
        return name && name !== 'guest';
      });
      setCustomers(filtered);
    } catch (_) { }
  }, []);

  const loadCategories = React.useCallback(async () => {
    try {
      const resp = await stockService.listCategories({});
      const list = resp?.data?.data || resp?.data || resp || [];
      setCategories(list);
    } catch (_) { }
  }, []);

  const loadAccounts = React.useCallback(async () => {
    try {
      const resp = await accountService.listAccounts();
      const data = resp?.data || resp || {};
      const accountsList = Array.isArray(data) ? data : (data.accounts || []);
      // Filter only active accounts that can receive payments (cash, bank, custom)
      const activeAccounts = accountsList.filter(acc =>
        acc.is_active !== false &&
        ['cash', 'bank', 'custom'].includes((acc.type || '').toLowerCase())
      );
      setAccounts(activeAccounts);

      // Auto-select cash account if available
      const normalizeType = (acc) => (acc?.type || '').toLowerCase();
      const cashAccount = activeAccounts.find(acc => normalizeType(acc) === 'cash');
      const bankAccount = activeAccounts.find(acc => normalizeType(acc) === 'bank');

      // Set default deposit account based on current payment mode
      if (paymentMode === 'cash' && cashAccount) {
        setDepositAccountId(String(cashAccount.id));
      } else if (paymentMode === 'online' && bankAccount) {
        setDepositAccountId(String(bankAccount.id));
      } else if (cashAccount) {
        setDepositAccountId(String(cashAccount.id));
      } else if (activeAccounts.length > 0) {
        setDepositAccountId(String(activeAccounts[0].id));
      }

      // Set split payment defaults
      setSplitPayments(prev => ({
        cash: {
          ...prev.cash,
          accountId: prev.cash.accountId || (cashAccount ? String(cashAccount.id) : (activeAccounts[0] ? String(activeAccounts[0].id) : '')),
        },
        online: {
          ...prev.online,
          accountId: prev.online.accountId || (bankAccount ? String(bankAccount.id) : (activeAccounts[0] ? String(activeAccounts[0].id) : '')),
        },
      }));
    } catch (_) { }
  }, [paymentMode]);

  React.useEffect(() => { loadCatalog(); }, [loadCatalog]);
  const loadCustomerProfile = React.useCallback(async (id) => {
    if (!id) {
      setCustomerProfile(null);
      setCustomerReservations([]);
      setActiveReservation(null);
      return null;
    }
    try {
      const resp = await customerService.profile(id);
      const profile = resp?.data || resp || {};
      setCustomerProfile(profile);
      const reservationsPayload = profile?.reservations
        || profile?.pending_reservations
        || profile?.active_reservations
        || profile?.reservation_preview
        || [];
      setCustomerReservations(Array.isArray(reservationsPayload) ? reservationsPayload : []);
      setActiveReservation(null);
      setReservationBannerDismissed(false);
      return profile;
    } catch (_) {
      setCustomerProfile(null);
      setCustomerReservations([]);
      return null;
    }
  }, []);

  React.useEffect(() => { loadCustomers(); loadCategories(); }, [loadCustomers, loadCategories]);
  React.useEffect(() => { loadAccounts(); }, [loadAccounts]);
  React.useEffect(() => { loadCustomerProfile(customerId); }, [customerId, loadCustomerProfile]);



  // Reset reservation mode and payment_as when customer is cleared (guest)
  React.useEffect(() => {
    if (!customerId) {
      // Reset to sale mode if reservation mode was active
      setReservationMode(prev => {
        if (prev === 'reserve') {
          toast({
            title: 'Reservation mode disabled',
            description: 'Reservations require a customer. Switched to immediate sale mode.',
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
          return 'sale';
        }
        return prev;
      });
      // Reset payment_as to 'payment' if it was 'advance'
      setPaymentAs(prev => prev === 'advance' ? 'payment' : prev);
    }
  }, [customerId, toast]);

  const reservationsList = React.useMemo(() => {
    return (customerReservations || []).map((res, idx) => ({
      ...res,
      id: res.id || res.reservation_id || `reservation-${idx + 1}`,
      status: res.status || res.state || 'pending',
      items: Array.isArray(res.items) ? res.items : (Array.isArray(res.lines) ? res.lines : []),
    }));
  }, [customerReservations]);

  const hasReservations = reservationsList.length > 0;

  const reservationStatusColor = React.useCallback((status) => {
    const normalized = (status || '').toLowerCase();
    if (normalized.includes('ready')) return 'green';
    if (normalized.includes('expired')) return 'red';
    if (normalized.includes('hold')) return 'purple';
    return 'orange';
  }, []);

  const handleReservationLoad = React.useCallback((reservation) => {
    if (!reservation) return;
    if (!Array.isArray(reservation.items) || reservation.items.length === 0) {
      toast({
        title: 'Reservation items missing',
        description: 'This reservation did not return any item lines from the API.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    const hydratedLines = reservation.items.map((item, idx) => {
      const product = items.find(prod => Number(prod.id) === Number(item.stock_item_id));
      const unitType = item.unit_type || 'primary';
      // Use sold_quantity if available (original quantity in the unit_type), otherwise fall back to quantity
      const quantity = Number(item.sold_quantity ?? item.qty ?? item.quantity ?? 1);
      // Get unit price - should be in the unit_type specified
      let unitPrice = Number(item.unit_price || item.price || 0);
      const basePricePrimary = product?.price || 0;

      // If no unit_price from API and we have product info, calculate based on unit_type
      if (!unitPrice && product) {
        if (unitType === 'secondary' && product.secondaryPerPrimary && product.secondaryPerPrimary > 0) {
          // Calculate secondary price from primary price
          unitPrice = basePricePrimary / product.secondaryPerPrimary;
        } else {
          unitPrice = basePricePrimary;
        }
      }

      return {
        id: item.stock_item_id || product?.id || `reserved-${idx}`,
        name: product?.name || item.name || `Reserved Item ${idx + 1}`,
        serial_id: product?.serial_id || '',
        price: unitPrice,
        basePrice: basePricePrimary,
        cost: product?.cost || 0,
        qty: quantity,
        reservedQty: quantity,
        hiddenCost: Number(item.hidden_cost || 0),
        unitType,
        primaryUnit: product?.primaryUnit || '',
        secondaryUnit: product?.secondaryUnit || '',
        secondaryPerPrimary: product?.secondaryPerPrimary || null,
      };
    });

    if (!hydratedLines.length) {
      toast({
        title: 'Unable to load reservation items',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setCart(hydratedLines);
    setActiveReservation(reservation);
    setReservationMode('sale');
    setReservationBannerDismissed(true);
    toast({
      title: 'Reservation loaded',
      description: `Loaded ${hydratedLines.length} reserved item(s) for ${customerProfile?.name || 'customer'}.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [items, customerProfile, toast]);

  const handleReservationRelease = React.useCallback(async (reservation) => {
    if (!reservation?.id) return;
    const reason = window.prompt(
      'Add a release note (optional):',
      `Released from POS on ${new Date().toLocaleDateString()}`
    );
    setReservationActionLoading(true);
    setReservationActionId(reservation.id);
    try {
      const payload = removeUndefined({
        reason: reason || 'Released from POS',
      });
      await reservationService.releaseReservation(reservation.id, payload);
      toast({
        title: 'Reservation released',
        description: `Reservation ${reservation.reference || reservation.id} has been released.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      if (customerId) {
        await loadCustomerProfile(customerId);
      }
      loadCatalog();
    } catch (error) {
      const errorMessages = error?.errors
        ? Object.values(error.errors).flat().join('\n')
        : '';
      toast({
        title: 'Failed to release reservation',
        description: errorMessages || error?.message || 'Unexpected error while releasing reservation.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setReservationActionLoading(false);
      setReservationActionId(null);
    }
  }, [customerId, loadCustomerProfile, loadCatalog, toast]);


  // Calculate additional stock (beyond reservation) from cart
  // All stock is tracked in primary units, so convert secondary units to primary
  const reservedStock = React.useMemo(() => {
    const reserved = {};
    cart.forEach(item => {
      // Both qty and reservedQty are in the same unit (primary or secondary)
      // Convert both to primary units for stock calculation
      let qtyInPrimary = Number(item.qty || 0);
      let reservedQtyInPrimary = Math.max(0, item.reservedQty || 0);

      if (item.unitType === 'secondary' && item.secondaryPerPrimary && item.secondaryPerPrimary > 0) {
        qtyInPrimary = qtyInPrimary / item.secondaryPerPrimary;
        reservedQtyInPrimary = reservedQtyInPrimary / item.secondaryPerPrimary;
      }

      const extraNeeded = Math.max(0, qtyInPrimary - reservedQtyInPrimary);
      if (extraNeeded > 0) {
        reserved[item.id] = (reserved[item.id] || 0) + extraNeeded;
      }
    });
    return reserved;
  }, [cart]);

  // Update items with available stock (original - reserved)
  React.useEffect(() => {
    setItems(prev => prev.map(item => {
      const ledger = originalStock[item.id];
      const baseAvailable = ledger && typeof ledger === 'object'
        ? ledger.available
        : ledger;
      const onHand = ledger && typeof ledger === 'object'
        ? ledger.onHand
        : ledger;
      const backendReserved = ledger && typeof ledger === 'object'
        ? ledger.reserved || 0
        : 0;
      const reserved = reservedStock[item.id] || 0;
      const available = baseAvailable !== null && baseAvailable !== undefined
        ? Math.max(0, baseAvailable - reserved)
        : null;
      return {
        ...item,
        stock: available,
        available,
        stock_on_hand: onHand,
        reserved: backendReserved + reserved,
      };
    }));
  }, [originalStock, reservedStock]);

  const addToCart = (p) => {
    // Get original stock and calculate available (original - already reserved)
    const ledger = originalStock[p.id];
    const original = ledger && typeof ledger === 'object'
      ? ledger.available
      : ledger;
    const reserved = reservedStock[p.id] || 0;
    const available = original !== null && original !== undefined
      ? Math.max(0, original - reserved)
      : null;

    // Check if stock is available
    if (available !== null && available <= 0) {
      toast({
        title: 'Out of stock',
        description: `${p.name} is out of stock.`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setCart(prev => {
      const idx = prev.findIndex(x => x.id === p.id);
      if (idx >= 0) {
        const copy = [...prev];
        const existing = copy[idx];
        const newQty = existing.qty + 1;

        // Double-check stock availability against original stock
        // Convert to primary units if selling in secondary units
        let requestedInPrimary = newQty;
        if (existing.unitType === 'secondary' && existing.secondaryPerPrimary && existing.secondaryPerPrimary > 0) {
          requestedInPrimary = newQty / existing.secondaryPerPrimary;
        }

        if (original !== null && original !== undefined && requestedInPrimary > original) {
          const remaining = original - (existing.unitType === 'secondary' && existing.secondaryPerPrimary ? existing.qty / existing.secondaryPerPrimary : existing.qty);
          const remainingDisplay = existing.unitType === 'secondary' && existing.secondaryPerPrimary
            ? remaining * existing.secondaryPerPrimary
            : remaining;
          const unitLabel = existing.unitType === 'secondary' ? existing.secondaryUnit : existing.primaryUnit;
          toast({
            title: 'Insufficient stock',
            description: `Only ${remainingDisplay.toFixed(2)} more ${unitLabel} available for ${p.name}.`,
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
          return prev;
        }

        const reservedQty = Math.min(existing.reservedQty || 0, newQty);
        copy[idx] = {
          ...existing,
          basePrice: getBasePrice(existing) || Number(p.price || 0),
          qty: newQty,
          reservedQty,
        };
        return copy;
      }
      return [...prev, {
        id: p.id,
        name: p.name,
        serial_id: p.serial_id || '',
        price: p.price,
        basePrice: p.price,
        cost: p.cost,
        qty: 1,
        reservedQty: 0,
        hiddenCost: 0,
        unitType: 'primary',
        primaryUnit: p.primaryUnit || '',
        secondaryUnit: p.secondaryUnit || '',
        secondaryPerPrimary: p.secondaryPerPrimary || null,
      }];
    });
  };

  const changeQty = (id, delta) => {
    const item = items.find(it => it.id === id);
    if (!item) return;

    const cartItem = cart.find(x => x.id === id);
    if (!cartItem) return;

    const ledger = originalStock[id];
    const original = ledger && typeof ledger === 'object'
      ? ledger.available
      : ledger;
    const currentQty = cartItem.qty;
    const newQty = currentQty + delta;

    // Check stock availability when increasing quantity
    // Convert to primary units if selling in secondary units
    if (delta > 0 && original !== null && original !== undefined) {
      let requestedInPrimary = newQty;
      if (cartItem.unitType === 'secondary' && cartItem.secondaryPerPrimary && cartItem.secondaryPerPrimary > 0) {
        requestedInPrimary = newQty / cartItem.secondaryPerPrimary;
      }
      let currentInPrimary = currentQty;
      if (cartItem.unitType === 'secondary' && cartItem.secondaryPerPrimary && cartItem.secondaryPerPrimary > 0) {
        currentInPrimary = currentQty / cartItem.secondaryPerPrimary;
      }

      if (requestedInPrimary > original) {
        const available = original - currentInPrimary;
        const availableDisplay = cartItem.unitType === 'secondary' && cartItem.secondaryPerPrimary
          ? available * cartItem.secondaryPerPrimary
          : available;
        const unitLabel = cartItem.unitType === 'secondary' ? cartItem.secondaryUnit : cartItem.primaryUnit;
        toast({
          title: 'Insufficient stock',
          description: `Only ${availableDisplay.toFixed(2)} more ${unitLabel} available for ${item.name}.`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }

    setCart(prev => prev.map(x => {
      if (x.id !== id) return x;
      const updatedQty = Math.max(1, x.qty + delta);
      const reservedQty = Math.min(x.reservedQty || 0, updatedQty);
      return {
        ...x,
        basePrice: getBasePrice(x),
        qty: updatedQty,
        reservedQty,
      };
    }));
  };

  const removeLine = (id) => setCart(prev => prev.filter(x => x.id !== id));

  // Calculate base subtotal - convert base price to current unit type
  const baseSubtotal = cart.reduce((s, l) => {
    const basePricePrimary = getBasePrice(l);
    let basePriceInCurrentUnit = basePricePrimary;
    if (l.unitType === 'secondary' && l.secondaryPerPrimary && l.secondaryPerPrimary > 0) {
      basePriceInCurrentUnit = basePricePrimary / l.secondaryPerPrimary;
    }
    return s + l.qty * basePriceInCurrentUnit;
  }, 0);

  // Calculate manual discount - compare prices in the same unit type
  const manualDiscount = cart.reduce((s, l) => {
    const basePricePrimary = getBasePrice(l);
    let basePriceInCurrentUnit = basePricePrimary;
    if (l.unitType === 'secondary' && l.secondaryPerPrimary && l.secondaryPerPrimary > 0) {
      basePriceInCurrentUnit = basePricePrimary / l.secondaryPerPrimary;
    }
    const diff = basePriceInCurrentUnit - l.price;
    return diff > 0 ? s + diff * l.qty : s;
  }, 0);
  const subtotal = cart.reduce((s, l) => s + l.qty * l.price, 0);
  const discountFromPercent = discountPercent ? subtotal * (Number(discountPercent) / 100) : 0;
  const discountFixed = Number(discountAmount || 0);
  const hiddenCostsAmount = cart.reduce((s, l) => s + Number(l.hiddenCost || 0), 0);
  const total = Math.max(0, subtotal - discountFromPercent - discountFixed + hiddenCostsAmount);
  const totalDiscount = manualDiscount + discountFromPercent + discountFixed;

  // Calculate COGS Loss: when selling price < purchase cost
  // Loss = (cost - selling_price) × quantity
  const cogsLoss = cart.reduce((s, l) => {
    const cost = Number(l.cost || 0);
    const sellingPrice = Number(l.price || 0);
    const qty = Number(l.qty || 0);

    // Convert cost to current unit type if selling in secondary units
    let costInCurrentUnit = cost;
    if (l.unitType === 'secondary' && l.secondaryPerPrimary && l.secondaryPerPrimary > 0) {
      costInCurrentUnit = cost / l.secondaryPerPrimary;
    }

    // Only calculate loss if cost > 0 and selling price < cost
    if (costInCurrentUnit > 0 && sellingPrice < costInCurrentUnit) {
      const lossPerUnit = costInCurrentUnit - sellingPrice;
      return s + (lossPerUnit * qty);
    }
    return s;
  }, 0);

  const totalQty = cart.reduce((s, l) => s + l.qty, 0);
  const originalUnitPrice = totalQty ? baseSubtotal / totalQty : 0;

  // Advance math preview
  const existingAdvance = Number(customerProfile?.advance_balance || 0);
  const outstandingDue = Number(customerProfile?.due_balance || customerProfile?.total_due || 0);
  const reservedValue = Number(customerProfile?.reserved_value || 0);
  const reservationAdvanceAvailableRaw = Number(
    activeReservation?.advance_remaining ??
    activeReservation?.advance_applied ??
    activeReservation?.advance_amount ??
    0
  );
  const reservationAdvanceAvailable = Number.isFinite(reservationAdvanceAvailableRaw)
    ? Math.max(0, reservationAdvanceAvailableRaw)
    : 0;
  // Determine if we should apply advance from reservation
  const applyReservationAdvance = Boolean(activeReservation) &&
    paymentAs !== 'advance' &&
    reservationAdvanceAvailable > 0;

  // Determine if we should apply advance from wallet (separate from reservations)
  // Automatically apply if available, unless it's a reservation (handled separately)
  const applyWalletAdvanceEffective = existingAdvance > 0 && !activeReservation;

  const customerAdvanceAvailable = Math.max(0, existingAdvance);

  // Calculate advance pool: reservation advance takes priority, then wallet advance
  const advancePool = applyReservationAdvance
    ? (customerAdvanceAvailable > 0
      ? Math.min(customerAdvanceAvailable, reservationAdvanceAvailable || customerAdvanceAvailable)
      : reservationAdvanceAvailable)
    : (applyWalletAdvanceEffective
      ? customerAdvanceAvailable
      : 0);

  const splitPaidTotal = Number(splitPayments.cash.amount || 0) + Number(splitPayments.online.amount || 0);
  const payNow = paymentMode === 'split'
    ? splitPaidTotal
    : Number(paidAmount || 0);

  // New Logic: Cash First, then Advance
  // 1. Calculate how much is remaining after manual payment
  const remainingAfterPayNow = Math.max(0, total - payNow);

  // 2. Calculate max possible advance to apply (capped by remaining amount and available advance)
  const maxAdvanceToApply = Math.min(remainingAfterPayNow, advancePool);

  // 3. Determine final advance amount to apply
  // If user specified a custom amount, use it (clamped), otherwise use max possible
  const applyAdvanceEffective = applyReservationAdvance || applyWalletAdvanceEffective;

  let applyFromAdvance = 0;
  if (applyAdvanceEffective) {
    if (customAdvanceAmount !== '') {
      // User entered a specific amount
      // Clamp it between 0 and max possible (cannot use more than needed or more than available)
      applyFromAdvance = Math.min(Number(customAdvanceAmount), maxAdvanceToApply);
    } else {
      // Default behavior: Auto-fill remainder
      applyFromAdvance = maxAdvanceToApply;
    }
  }

  const remainingAfterAdvance = Math.max(0, total - applyFromAdvance);

  // Update remainingAfterPay calculation to reflect that payNow is already accounted for in advance logic
  // Actually, we need to calculate the final due/excess based on both
  // Total Paid = payNow + applyFromAdvance
  const totalPaid = payNow + applyFromAdvance;
  const remainingDue = Math.max(0, total - totalPaid);
  const excessPaid = Math.max(0, totalPaid - total);

  // New Advance Balance Calculation
  // If we used advance, it decreases. If we overpaid with cash, it increases.
  // Note: applyFromAdvance comes FROM advance. payNow might go TO advance if excess.
  const newAdvance = existingAdvance - applyFromAdvance + excessPaid;

  const estimatedDue = remainingDue;
  const estimatedNewAdvance = newAdvance;

  // Helper function to remove undefined values from payload
  const removeUndefined = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(item => removeUndefined(item)).filter(item => item !== undefined);
    } else if (obj !== null && typeof obj === 'object') {
      const cleaned = {};
      for (const key in obj) {
        if (obj[key] !== undefined) {
          cleaned[key] = removeUndefined(obj[key]);
        }
      }
      return cleaned;
    }
    return obj;
  };
  const createReservationFlow = async () => {
    if (cart.length === 0) return;
    if (!customerId) {
      toast({
        title: 'Select a customer',
        description: 'Reservations require a customer profile. Please choose a customer before reserving stock.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    if (paymentMode === 'split') {
      toast({
        title: 'Split advance not supported (yet)',
        description: 'Please choose Cash or Online to record the advance for this reservation.',
        status: 'info',
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    const advanceAmountNumeric = Number(paidAmount || 0);
    if (advanceAmountNumeric > 0 && !depositAccountId) {
      toast({
        title: 'Select a deposit account',
        description: 'Choose the account where the advance will be deposited.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    setCheckoutLoading(true);
    try {
      const advancePayment =
        advanceAmountNumeric > 0
          ? {
            amount: advanceAmountNumeric,
            deposit_account_id: Number(depositAccountId),
            method: paymentMode === 'online' ? 'bank' : 'cash',
          }
          : undefined;
      const payload = {
        customer_id: Number(customerId),
        pickup_date: reservePickupDate || undefined,
        note: reserveNote || undefined,
        items: cart.map(l => ({
          stock_item_id: l.id,
          quantity: l.qty,
          unit_type: l.unitType || 'primary',
          unit_price: l.price,
          hidden_cost: l.hiddenCost !== undefined ? Number(l.hiddenCost || 0) : undefined,
        })),
        advance_payment: advancePayment,
      };
      const cleanedPayload = removeUndefined(payload);
      const response = await reservationService.createReservation(cleanedPayload);
      const reservationMeta = extractReservationMeta(response);
      if (reservationMeta?.id) {
        setLastReservationMeta(reservationMeta);
        triggerReservationReceiptPrint(reservationMeta.id, { silent: true });
      }
      setCart([]);
      setDiscountAmount('');
      setDiscountPercent('');
      setReserveNote('');
      setReservePickupDate('');
      setActiveReservation(null);
      setReservationMode('sale');
      loadCatalog();
      if (customerId) {
        await loadCustomerProfile(customerId);
      }
      window.dispatchEvent(new CustomEvent('stock-updated'));
      toast({
        title: 'Reservation recorded',
        description: `Reservation ${response?.reference || response?.data?.reference || ''} saved with ${cart.length} item(s).`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      const errorMessages = error?.errors
        ? Object.values(error.errors).flat().join('\n')
        : '';
      toast({
        title: 'Failed to reserve stock',
        description: errorMessages || error?.message || 'Unexpected error while creating reservation.',
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const generateInvoice = async () => {
    if (cart.length === 0 || checkoutLoading) return;
    if (reservationMode === 'reserve') {
      await createReservationFlow();
      return;
    }

    // Prevent advance payments for guest customers
    if (!customerId && paymentAs === 'advance') {
      toast({
        title: 'Advance payment requires customer',
        description: 'Please select a customer to record advance payments. Guest customers cannot have advance payments.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Prevent guests from having any due balance
    if (!customerId && estimatedDue > 0) {
      toast({
        title: 'Guest customers cannot have due balance',
        description: 'Please add this customer to the system to enable due balance tracking. Guest customers must pay the full amount.',
        status: 'warning',
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    if (paymentMode !== 'split' && !depositAccountId) {
      toast({
        title: 'Missing deposit account',
        description: 'Please select a deposit account before checkout.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setCheckoutLoading(true);
    try {
      const payload = {
        customer_id: customerId ? Number(customerId) : undefined,
        discount_percent: discountPercent ? Number(discountPercent) : undefined,
        discount_amount: discountAmount ? Number(discountAmount) : undefined,
        due_date: dueDate || undefined,
        pickup_date: reservePickupDate || undefined,
        salesperson_user_id: user?.id ? Number(user.id) : undefined,
        apply_advance: applyAdvanceEffective,
        advance_amount_hint: applyFromAdvance > 0 ? Number(applyFromAdvance.toFixed(2)) : undefined,
        advance_to_apply: applyFromAdvance > 0 ? Number(applyFromAdvance.toFixed(2)) : undefined,
        reservation_id: activeReservation?.id,
        reservation_reference: activeReservation?.reference || activeReservation?.code,
        reservation_note: reserveNote || undefined,
        items: cart.map(l => ({
          stock_item_id: l.id,
          quantity: l.qty,
          unit_type: l.unitType || 'primary',
          unit_price: l.price,
          hidden_cost: l.hiddenCost !== undefined ? Number(l.hiddenCost || 0) : undefined,
        })),
      };
      const payAmountValue = payNow > 0 ? payNow : undefined;

      if (paymentMode === 'split') {
        const cashAmount = Number(splitPayments.cash.amount || 0);
        const onlineAmount = Number(splitPayments.online.amount || 0);
        const breakdown = [];
        if (cashAmount > 0) {
          const cashAccountId = splitPayments.cash.accountId || (cashAccounts[0] ? String(cashAccounts[0].id) : '');
          if (!cashAccountId) {
            toast({
              title: 'Missing cash account',
              description: 'Select an account for the cash portion.',
              status: 'warning',
              duration: 5000,
              isClosable: true,
            });
            return;
          }
          breakdown.push({
            payment_method: 'cash',
            amount: cashAmount,
            deposit_account_id: Number(cashAccountId),
          });
        }
        if (onlineAmount > 0) {
          const onlineAccountId = splitPayments.online.accountId || (onlineAccounts[0] ? String(onlineAccounts[0].id) : '');
          if (!onlineAccountId) {
            toast({
              title: 'Missing online account',
              description: 'Select an account for the online portion.',
              status: 'warning',
              duration: 5000,
              isClosable: true,
            });
            return;
          }
          // Backend accepts 'bank' for all online/digital payments
          breakdown.push({
            payment_method: 'bank',
            amount: onlineAmount,
            deposit_account_id: Number(onlineAccountId),
          });
        }
        if (!breakdown.length) {
          toast({
            title: 'Missing payment amounts',
            description: 'Enter at least one payment amount for split checkout.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
          return;
        }
        // For split payments, use the first payment method as the main payment_method
        // The backend will use payment_breakdown to process the split
        const firstPayment = breakdown[0];
        payload.payment_method = firstPayment?.payment_method || 'cash';
        payload.payment_breakdown = breakdown;
        if (firstPayment?.deposit_account_id) {
          payload.deposit_account_id = Number(firstPayment.deposit_account_id);
        }
        payload.payment_as = 'payment';
        if (payAmountValue) {
          payload.paid_amount = payAmountValue;
        }
      } else {
        // For cash or online payment
        // Check account type to determine correct payment method
        const selectedAccount = accounts.find(acc => String(acc.id) === String(depositAccountId));
        const accountType = (selectedAccount?.type || '').toLowerCase();

        let paymentMethodValue;
        if (paymentMode === 'cash') {
          paymentMethodValue = 'cash';
        } else if (paymentMode === 'online') {
          // Backend might validate that payment_method matches account type
          // If account is bank type, use 'bank', otherwise might need 'card' or other
          paymentMethodValue = accountType === 'bank' ? 'bank' : 'card';
        } else {
          paymentMethodValue = 'cash'; // fallback
        }

        payload.payment_method = paymentMethodValue;
        payload.deposit_account_id = Number(depositAccountId);
        if (payAmountValue) {
          payload.paid_amount = payAmountValue;
          // Prevent advance payments for guest customers
          if (!customerId && paymentAs === 'advance') {
            // Force to 'payment' for guests
            payload.payment_as = 'payment';
          } else {
            payload.payment_as = paymentAs === 'advance' ? 'advance' : paymentAs;
          }
        } else {
          // When customer is selected, always set payment_as to help backend calculate final due amount
          // For guest, never set payment_as to 'advance'
          if (customerId) {
            payload.payment_as = paymentAs === 'advance' ? 'advance' : 'payment';
          } else {
            // Guest customers can only make payments, not advances
            payload.payment_as = 'payment';
          }
        }
      }
      // Remove all undefined values from payload before sending
      const cleanedPayload = removeUndefined(payload);

      // Calculate and log COGS loss for debugging
      const itemsWithLoss = cart.map(l => {
        const cost = Number(l.cost || 0);
        const sellingPrice = Number(l.price || 0);
        const qty = Number(l.qty || 0);

        // Convert cost to current unit type if selling in secondary units
        let costInCurrentUnit = cost;
        if (l.unitType === 'secondary' && l.secondaryPerPrimary && l.secondaryPerPrimary > 0) {
          costInCurrentUnit = cost / l.secondaryPerPrimary;
        }

        const lossPerUnit = costInCurrentUnit > 0 && sellingPrice < costInCurrentUnit
          ? costInCurrentUnit - sellingPrice
          : 0;
        const itemLoss = lossPerUnit * qty;

        return {
          stock_item_id: l.id,
          name: l.name,
          cost: costInCurrentUnit,
          selling_price: sellingPrice,
          quantity: qty,
          unit_type: l.unitType || 'primary',
          loss_per_unit: lossPerUnit,
          total_loss: itemLoss,
          has_loss: itemLoss > 0
        };
      });
      const totalCogsLoss = itemsWithLoss.reduce((sum, item) => sum + item.total_loss, 0);

      // Log the payload for debugging
      console.log('=== POS Invoice Payload ===');
      console.log('Customer ID:', customerId);
      console.log('Payment Mode:', paymentMode);
      console.log('Deposit Account ID:', depositAccountId);
      console.log('Selected Account:', accounts.find(acc => String(acc.id) === String(depositAccountId)));
      console.log('Pay Amount Value:', payAmountValue);
      console.log('Payment As:', paymentAs);
      console.log('Apply Advance:', applyAdvanceEffective);
      console.log('Advance To Apply (slider):', applyFromAdvance);
      console.log('Reservation Mode:', reservationMode);
      console.log('Active Reservation:', activeReservation?.id || 'none');
      console.log('Payment Method in Payload:', cleanedPayload.payment_method);
      console.log('--- COGS Loss Calculation ---');
      console.log('Items with Loss Details:', itemsWithLoss);
      console.log('Total COGS Loss:', totalCogsLoss);
      console.log('Expected Loss Breakdown:', {
        items_with_loss: itemsWithLoss.filter(i => i.has_loss),
        total_cogs_loss: totalCogsLoss,
        note: 'Backend should automatically record this to LOSS-001 account'
      });
      console.log('Full Payload:', JSON.stringify(cleanedPayload, null, 2));
      console.log('==========================');

      const response = activeReservation?.id
        ? await reservationService.completeReservation(activeReservation.id, cleanedPayload)
        : await invoiceService.createInvoice(cleanedPayload);
      const invoiceMeta = extractInvoiceMeta(response);
      if (invoiceMeta?.id) {
        setLastInvoiceMeta(invoiceMeta);
        triggerInvoicePrint(invoiceMeta.id, { silent: true });
      }
      // clear cart and reset reserved stock
      setCart([]);
      setDiscountAmount(''); setDiscountPercent('');
      setActiveReservation(null);
      setReservationMode('sale');
      setReserveNote('');
      setReservePickupDate('');
      // Reload catalog to get updated stock from backend
      loadCatalog();
      if (customerId) {
        setCustomerProfile(prev => ({
          ...(prev || {}),
          id: prev?.id || Number(customerId),
          due_balance: Number(estimatedDue.toFixed(2)),
          advance_balance: Number(estimatedNewAdvance.toFixed(2)),
        }));
      }
      // Notify stock table to refresh
      window.dispatchEvent(new CustomEvent('invoice-created'));
      window.dispatchEvent(new CustomEvent('stock-updated'));
      if (customerId) {
        const updatedProfile = await loadCustomerProfile(customerId);
        if (!updatedProfile || typeof updatedProfile !== 'object') {
          const due = response?.data?.customer_due_balance ?? response?.customer_due_balance;
          const advance = response?.data?.customer_advance_balance ?? response?.customer_advance_balance;
          if (typeof due !== 'undefined' || typeof advance !== 'undefined') {
            setCustomerProfile(prev => ({
              ...(prev || {}),
              due_balance: typeof due !== 'undefined' ? Number(due) : prev?.due_balance ?? 0,
              advance_balance: typeof advance !== 'undefined' ? Number(advance) : prev?.advance_balance ?? 0,
              id: prev?.id || Number(customerId),
            }));
          }
        }
      }
      toast({
        title: 'Invoice created',
        description: 'The invoice has been recorded successfully.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (e) {
      const errorMessages = e?.errors
        ? Object.values(e.errors).flat().join('\n')
        : '';
      const message = e?.message || 'Failed to create invoice';
      toast({
        title: 'Validation errors',
        description: errorMessages || message,
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
      <Text fontSize='2xl' color={textColor} fontWeight='bold' mb='3'>Point of Sale</Text>



      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap='16px'>
        {/* Left: Catalog */}
        <GridItem>
          <Card>
            <CardHeader>
              <HStack spacing='12px' wrap='wrap'>
                <Input placeholder='Search products...' value={catalogSearch} onChange={(e) => setCatalogSearch(e.target.value)} width='260px' onKeyDown={(e) => { if (e.key === 'Enter') loadCatalog(); }} />
                <Select placeholder='All Categories' value={categoryId} onChange={(e) => setCategoryId(e.target.value)} width='200px'>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                <Button onClick={loadCatalog} variant='outline' borderColor='#FF8D28' color='#FF8D28'>Search</Button>
              </HStack>
            </CardHeader>
            <CardBody>
              {loading ? (
                <Flex align='center' justify='center' py='24px'><Spinner /></Flex>
              ) : (
                <Grid templateColumns={{ base: 'repeat(1,1fr)', md: 'repeat(2,1fr)', xl: 'repeat(3,1fr)' }} gap='12px'>
                  {items.map(p => {
                    const stock = typeof p.stock !== 'undefined' && p.stock !== null ? Number(p.stock) : null;
                    const isLowStock = stock !== null && stock < 10 && stock > 0;
                    const isOutOfStock = stock !== null && stock === 0;
                    const hasStock = stock !== null;
                    return (
                      <Box
                        key={p.id}
                        borderWidth={isLowStock || isOutOfStock ? '2px' : '1px'}
                        borderRadius='12px'
                        p='12px'
                        borderColor={isLowStock ? 'orange.400' : isOutOfStock ? 'red.300' : 'gray.200'}
                        bg={isLowStock ? 'orange.50' : isOutOfStock ? 'red.50' : undefined}
                        position='relative'
                      >
                        <Image src={p.image} alt={p.name} borderRadius='8px' w='100%' h='120px' objectFit='cover' mb='8px' />
                        <Text fontWeight='semibold' mb='1' noOfLines={1}>{p.name}</Text>
                        {p.serial_id && (
                          <Text fontSize='xs' color='gray.500' mb='1'>Serial: {p.serial_id}</Text>
                        )}
                        <VStack align='stretch' spacing='8px' mb='2'>
                          <HStack justify='space-between'>
                            <Text color='gray.600' fontSize='md' fontWeight='semibold'>PKR {p.price.toFixed(2)}</Text>
                          </HStack>
                          <Box>
                            <Text fontSize='xs' color='gray.500' mb='1'>Stock Quantity:</Text>
                            {hasStock ? (
                              <Badge
                                colorScheme={isOutOfStock ? 'red' : isLowStock ? 'orange' : 'green'}
                                fontSize='sm'
                                px='3'
                                py='1'
                                borderRadius='full'
                                fontWeight='bold'
                              >
                                {(() => {
                                  if (isOutOfStock) return 'OUT OF STOCK (0)';
                                  if (p.secondaryUnit && p.secondaryPerPrimary && p.secondaryPerPrimary > 0) {
                                    const secondaryQty = stock * p.secondaryPerPrimary;
                                    return isLowStock
                                      ? `LOW: ${stock} ${p.primaryUnit} (${secondaryQty.toFixed(1)} ${p.secondaryUnit})`
                                      : `${stock} ${p.primaryUnit} (${secondaryQty.toFixed(1)} ${p.secondaryUnit})`;
                                  }
                                  return isLowStock ? `LOW STOCK: ${stock}` : `IN STOCK: ${stock}`;
                                })()}
                              </Badge>
                            ) : (
                              <Badge
                                colorScheme='gray'
                                fontSize='sm'
                                px='3'
                                py='1'
                                borderRadius='full'
                              >
                                Stock: N/A
                              </Badge>
                            )}
                          </Box>
                        </VStack>
                        <Button
                          size='sm'
                          variant='outline'
                          borderColor='#FF8D28'
                          color='#FF8D28'
                          onClick={() => addToCart(p)}
                          w='100%'
                          isDisabled={isOutOfStock}
                        >
                          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </Box>
                    );
                  })}
                  {items.length === 0 && (
                    <Box textAlign='center' color='gray.500' gridColumn='1/-1'>No products</Box>
                  )}
                </Grid>
              )}
            </CardBody>
          </Card>
        </GridItem>

        {/* Right: Cart */}
        <GridItem>
          <Card>
            <CardHeader>
              <HStack justify='space-between'>
                <Text color={textColor} fontWeight='bold'>Cart ({cart.length} items)</Text>
                {cart.length > 0 && (
                  <Button
                    size='sm'
                    variant='ghost'
                    color='red.400'
                    onClick={() => {
                      setCart([]);
                      setActiveReservation(null);
                      setReservationMode('sale');
                      // Stock will automatically update via reservedStock useEffect
                    }}
                  >
                    Clear
                  </Button>
                )}
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align='stretch' spacing='16px'>
                {/* Checkout controls */}
                <VStack align='stretch' spacing='12px'>
                  <HStack align='stretch' spacing='12px'>
                    <Select
                      placeholder='Select customer'
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      width='100%'
                      size='md'>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>)}
                    </Select>
                    <Select
                      value={paymentMode}
                      onChange={(e) => handlePaymentModeChange(e.target.value)}
                      width='220px'
                      size='md'>
                      <option value='cash'>Cash</option>
                      <option value='online'>Online</option>
                      <option value='split'>Split (Cash + Online)</option>
                    </Select>
                  </HStack>
                  {customerId && hasReservations && !activeReservation && !reservationBannerDismissed && (
                    <Box
                      borderWidth='1px'
                      borderRadius='12px'
                      p='12px'
                      bg={useColorModeValue('orange.50', 'orange.900')}
                    >
                      <HStack justify='space-between' align='flex-start'>
                        <Box>
                          <Text fontWeight='semibold' color='orange.700' fontSize='sm'>
                            {customerProfile?.name || 'This customer'} has pending reservations
                          </Text>
                          <Text fontSize='xs' color='orange.600'>
                            Load the latest reservation to auto-fill the cart and lock in previously paid advance.
                          </Text>
                        </Box>
                        <HStack spacing='8px'>
                          <Button size='xs' colorScheme='orange' onClick={() => handleReservationLoad(reservationsList[0])}>
                            Load
                          </Button>
                          <Button size='xs' variant='ghost' onClick={() => setReservationBannerDismissed(true)}>
                            Dismiss
                          </Button>
                        </HStack>
                      </HStack>
                    </Box>
                  )}
                  {customerId && (existingAdvance > 0 || outstandingDue !== 0 || hasReservations) && (
                    <Box borderWidth='1px' borderRadius='12px' p='16px' bg={useColorModeValue('gray.50', 'gray.900')}>
                      <Flex justify='space-between' align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap='6px'>
                        <Box>
                          <Text fontWeight='semibold'>Customer overview</Text>
                          <Text fontSize='xs' color='gray.500'>
                            Wallet, dues, and any reserved stock at a glance.
                          </Text>
                        </Box>
                        {activeReservation && (
                          <Badge colorScheme='green' borderRadius='full'>
                            Completing reservation #{activeReservation.reference || activeReservation.id}
                          </Badge>
                        )}
                      </Flex>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing='10px' mt='12px'>
                        <Box borderWidth='1px' borderRadius='10px' p='10px' bg={useColorModeValue('white', 'gray.800')}>
                          <Text fontSize='xs' color='gray.500'>Advance wallet</Text>
                          <Text fontWeight='bold' fontSize='lg'>PKR {existingAdvance.toFixed(2)}</Text>
                        </Box>
                        <Box borderWidth='1px' borderRadius='10px' p='10px' bg={useColorModeValue('white', 'gray.800')}>
                          <Text fontSize='xs' color='gray.500'>Outstanding due</Text>
                          <Text fontWeight='bold' fontSize='lg' color={outstandingDue > 0 ? 'red.500' : 'green.500'}>
                            PKR {outstandingDue.toFixed(2)}
                          </Text>
                        </Box>

                      </SimpleGrid>
                      {hasReservations ? (
                        <VStack align='stretch' spacing='10px' mt='14px'>
                          <Text fontSize='xs' color='gray.500'>Reservations & held stock</Text>
                          {reservationsList.map((reservation) => (
                            <Box key={reservation.id} borderWidth='1px' borderRadius='10px' p='10px' bg={useColorModeValue('white', 'gray.800')}>
                              <HStack justify='space-between' align='flex-start'>
                                <Box>
                                  <Text fontSize='sm' fontWeight='semibold'>
                                    #{reservation.reference || reservation.id}
                                  </Text>
                                  <Text fontSize='xs' color='gray.500'>
                                    {reservation.items?.length || 0} item(s) • Advance PKR {Number(reservation.advance_applied || reservation.advance_amount || 0).toFixed(2)}
                                  </Text>
                                </Box>
                                <Badge colorScheme={reservationStatusColor(reservation.status)}>
                                  {reservation.status || 'pending'}
                                </Badge>
                              </HStack>
                              {reservation.items?.length ? (
                                <VStack align='stretch' spacing='4px' mt='8px'>
                                  {reservation.items.slice(0, 3).map((item, idx) => {
                                    const qty = Number(item.sold_quantity ?? item.qty ?? item.quantity ?? 1);
                                    const unitType = item.unit_type || 'primary';
                                    const unitLabel = unitType === 'secondary'
                                      ? (item.stockItem?.secondaryUnit?.symbol || item.stockItem?.secondaryUnit?.name || item.secondary_unit?.symbol || item.secondary_unit?.name || 'secondary')
                                      : (item.stockItem?.primaryUnit?.symbol || item.stockItem?.primaryUnit?.name || item.primary_unit?.symbol || item.primary_unit?.name || 'primary');
                                    return (
                                      <HStack key={`${reservation.id}-item-${idx}`} justify='space-between' fontSize='xs'>
                                        <Text noOfLines={1}>{item.name || `Item ${idx + 1}`}</Text>
                                        <Text color='gray.600'>Qty {qty} {unitLabel}</Text>
                                      </HStack>
                                    );
                                  })}
                                  {reservation.items.length > 3 && (
                                    <Text fontSize='xs' color='gray.500'>+ {reservation.items.length - 3} more item(s)</Text>
                                  )}
                                </VStack>
                              ) : (
                                <Text fontSize='xs' color='gray.500' mt='6px'>No items returned for this reservation.</Text>
                              )}
                              <HStack justify='flex-end' spacing='8px' mt='10px'>
                                <Button size='sm' colorScheme='orange' onClick={() => handleReservationLoad(reservation)}>
                                  Load items
                                </Button>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() => handleReservationRelease(reservation)}
                                  isLoading={reservationActionLoading && reservationActionId === reservation.id}
                                  loadingText='Releasing...'
                                >
                                  Release
                                </Button>
                              </HStack>
                            </Box>
                          ))}
                        </VStack>
                      ) : (
                        <Text fontSize='xs' color='gray.500' mt='12px'>
                          No reservations recorded for this customer yet.
                        </Text>
                      )}
                    </Box>
                  )}
                  <Box borderWidth='1px' borderRadius='12px' p='14px' bg={useColorModeValue('white', 'gray.900')}>
                    <Flex justify='space-between' align='center'>
                      <Box>
                        <Text fontWeight='semibold'>Fulfilment mode</Text>
                        <Text fontSize='xs' color='gray.500'>
                          Decide whether this interaction is an immediate sale or a reservation.
                        </Text>
                      </Box>
                      <Badge colorScheme={reservationMode === 'sale' ? 'green' : 'purple'}>
                        {reservationMode === 'sale' ? 'Immediate Sale' : 'Reserve Stock'}
                      </Badge>
                    </Flex>
                    <HStack mt='10px' spacing='8px'>
                      <Button
                        flex='1'
                        variant={reservationMode === 'sale' ? 'solid' : 'outline'}
                        colorScheme='green'
                        onClick={() => setReservationMode('sale')}
                      >
                        Immediate Sale
                      </Button>
                      <Button
                        flex='1'
                        variant={reservationMode === 'reserve' ? 'solid' : 'outline'}
                        colorScheme='purple'
                        isDisabled={!customerId}
                        onClick={() => {
                          if (!customerId) {
                            toast({
                              title: 'Reservation requires customer',
                              description: 'Please select a customer to create a reservation. Reservations cannot be made for guest customers.',
                              status: 'warning',
                              duration: 5000,
                              isClosable: true,
                            });
                            return;
                          }
                          setReservationMode('reserve');
                        }}
                      >
                        Reserve + Advance
                      </Button>
                    </HStack>
                    {!customerId && (
                      <Box mt='8px' p='8px' borderRadius='6px' bg={useColorModeValue('yellow.50', 'yellow.900')}>
                        <Text fontSize='xs' color='yellow.700'>
                          ⚠️ Reservations and advances require a customer to be selected. Guest customers can only make immediate sales.
                        </Text>
                      </Box>
                    )}
                    {reservationMode === 'reserve' && (
                      <VStack align='stretch' spacing='10px' mt='10px'>
                        <Text fontSize='xs' color='gray.500'>
                          Capture advance now and hold items until pickup. Checkout button is disabled until backend endpoints are wired.
                        </Text>
                        <Input
                          type='date'
                          value={reservePickupDate}
                          onChange={(e) => setReservePickupDate(e.target.value)}
                          placeholder='Pickup date'
                          size='sm'
                        />
                        <Input
                          value={reserveNote}
                          onChange={(e) => setReserveNote(e.target.value)}
                          placeholder='Reservation note / reference'
                          size='sm'
                        />
                      </VStack>
                    )}
                    {activeReservation && (
                      <Box
                        mt='10px'
                        p='10px'
                        borderRadius='10px'
                        bg={useColorModeValue('green.50', 'green.900')}
                      >
                        <Text fontSize='sm' fontWeight='semibold' color='green.700'>
                          Completing reservation #{activeReservation.reference || activeReservation.id}
                        </Text>
                        <Text fontSize='xs' color='green.700'>
                          Cart was pre-filled with reserved items. Adjust quantities if the customer changed their order.
                        </Text>
                      </Box>
                    )}
                  </Box>
                  {paymentMode === 'split' ? (
                    <Box borderWidth='1px' borderRadius='10px' p='16px' bg={useColorModeValue('gray.50', 'gray.800')}>
                      <Text fontWeight='semibold' fontSize='sm' mb='12px' color={textColor}>
                        Split Payment (Cash + Online)
                      </Text>
                      <VStack align='stretch' spacing='14px'>
                        <Box>
                          <Text fontSize='sm' fontWeight='medium' color='gray.700' mb='8px'>Cash Amount</Text>
                          <HStack align='flex-start' spacing='12px'>
                            <Input
                              width='160px'
                              type='number'
                              min='0'
                              step='0.01'
                              value={splitPayments.cash.amount}
                              onChange={(e) => handleSplitPaymentChange('cash', 'amount', e.target.value)}
                              placeholder='0.00'
                              size='md'
                            />
                            <Select
                              flex='1'
                              placeholder={cashAccounts.length ? 'Select cash account *' : 'Select account *'}
                              value={splitPayments.cash.accountId}
                              onChange={(e) => handleSplitPaymentChange('cash', 'accountId', e.target.value)}
                              borderColor={!splitPayments.cash.accountId && Number(splitPayments.cash.amount || 0) > 0 ? 'red.300' : undefined}
                              size='md'
                            >
                              {cashAccounts.length > 0 ? (
                                <>
                                  <optgroup label="Cash Accounts">
                                    {cashAccounts.map(acc => (
                                      <option key={`cash-${acc.id}`} value={acc.id}>
                                        {formatAccountName(acc)}
                                      </option>
                                    ))}
                                  </optgroup>
                                  {accounts.filter(acc => !cashAccounts.find(ca => ca.id === acc.id)).length > 0 && (
                                    <optgroup label="Other Accounts">
                                      {accounts.filter(acc => !cashAccounts.find(ca => ca.id === acc.id)).map(acc => (
                                        <option key={`cash-other-${acc.id}`} value={acc.id}>
                                          {formatAccountName(acc)}
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}
                                </>
                              ) : (
                                accounts.map(acc => (
                                  <option key={`cash-${acc.id}`} value={acc.id}>
                                    {formatAccountName(acc)}
                                  </option>
                                ))
                              )}
                            </Select>
                          </HStack>
                        </Box>
                        <Box>
                          <Text fontSize='sm' fontWeight='medium' color='gray.700' mb='8px'>Online Amount</Text>
                          <HStack align='flex-start' spacing='12px'>
                            <Input
                              width='160px'
                              type='number'
                              min='0'
                              step='0.01'
                              value={splitPayments.online.amount}
                              onChange={(e) => handleSplitPaymentChange('online', 'amount', e.target.value)}
                              placeholder='0.00'
                              size='md'
                            />
                            <Select
                              flex='1'
                              placeholder={onlineAccounts.length ? 'Select online account *' : 'Select account *'}
                              value={splitPayments.online.accountId}
                              onChange={(e) => handleSplitPaymentChange('online', 'accountId', e.target.value)}
                              borderColor={!splitPayments.online.accountId && Number(splitPayments.online.amount || 0) > 0 ? 'red.300' : undefined}
                              size='md'
                            >
                              {onlineAccounts.length > 0 ? (
                                <>
                                  <optgroup label="Bank/Online Accounts">
                                    {onlineAccounts.map(acc => (
                                      <option key={`online-${acc.id}`} value={acc.id}>
                                        {formatAccountName(acc)}
                                      </option>
                                    ))}
                                  </optgroup>
                                  {accounts.filter(acc => !onlineAccounts.find(oa => oa.id === acc.id)).length > 0 && (
                                    <optgroup label="Other Accounts">
                                      {accounts.filter(acc => !onlineAccounts.find(oa => oa.id === acc.id)).map(acc => (
                                        <option key={`online-other-${acc.id}`} value={acc.id}>
                                          {formatAccountName(acc)}
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}
                                </>
                              ) : (
                                accounts.map(acc => (
                                  <option key={`online-${acc.id}`} value={acc.id}>
                                    {formatAccountName(acc)}
                                  </option>
                                ))
                              )}
                            </Select>
                          </HStack>
                        </Box>
                        <Box pt='8px' borderTopWidth='1px' borderColor={useColorModeValue('gray.200', 'gray.600')}>
                          <Text fontSize='sm' fontWeight='semibold' color='gray.700'>
                            Total Paid Now: PKR {splitPaidTotal.toFixed(2)}
                          </Text>
                        </Box>
                      </VStack>
                    </Box>
                  ) : (
                    <Box>
                      <Text fontSize='sm' fontWeight='semibold' color='gray.700' mb='8px'>
                        Deposit Account *
                      </Text>
                      <Select
                        placeholder={`Select ${paymentMode === 'cash' ? 'cash' : paymentMode === 'online' ? 'bank/online' : 'deposit'} account *`}
                        value={depositAccountId}
                        onChange={(e) => setDepositAccountId(e.target.value)}
                        isRequired
                        borderColor={!depositAccountId ? 'red.300' : undefined}
                        size='md'>
                        {paymentMode === 'cash' && cashAccounts.length > 0 ? (
                          <>
                            <optgroup label="Cash Accounts">
                              {cashAccounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                  {formatAccountName(acc)}
                                </option>
                              ))}
                            </optgroup>
                            {accounts.filter(acc => !cashAccounts.find(ca => ca.id === acc.id)).length > 0 && (
                              <optgroup label="Other Accounts">
                                {accounts.filter(acc => !cashAccounts.find(ca => ca.id === acc.id)).map(acc => (
                                  <option key={acc.id} value={acc.id}>
                                    {formatAccountName(acc)}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                          </>
                        ) : paymentMode === 'online' && onlineAccounts.length > 0 ? (
                          <>
                            <optgroup label="Bank/Online Accounts">
                              {onlineAccounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                  {formatAccountName(acc)}
                                </option>
                              ))}
                            </optgroup>
                            {accounts.filter(acc => !onlineAccounts.find(oa => oa.id === acc.id)).length > 0 && (
                              <optgroup label="Other Accounts">
                                {accounts.filter(acc => !onlineAccounts.find(oa => oa.id === acc.id)).map(acc => (
                                  <option key={acc.id} value={acc.id}>
                                    {formatAccountName(acc)}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                          </>
                        ) : (
                          accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                              {formatAccountName(acc)}
                            </option>
                          ))
                        )}
                      </Select>
                      {depositAccountId && (() => {
                        const selectedAcc = accounts.find(a => String(a.id) === depositAccountId);
                        if (selectedAcc) {
                          const type = (selectedAcc.type || '').toLowerCase();
                          return (
                            <Text fontSize='xs' color='gray.500' mt='8px'>
                              Selected: {selectedAcc.name} {selectedAcc.code ? `(${selectedAcc.code})` : ''} •
                              Balance: PKR {Number(selectedAcc.balance || 0).toFixed(2)} •
                              Type: {type === 'cash' ? 'Cash' : type === 'bank' ? 'Bank' : 'Custom'}
                            </Text>
                          );
                        }
                        return null;
                      })()}
                    </Box>
                  )}
                  <HStack spacing='12px'>
                    <Box flex='1'>
                      <Text fontSize='xs' color='gray.600' mb='4px'>Discount %</Text>
                      <Input
                        placeholder='0'
                        type='number'
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        size='md'
                      />
                    </Box>
                    <Box flex='1'>
                      <Text fontSize='xs' color='gray.600' mb='4px'>Discount Amount</Text>
                      <Input
                        placeholder='0.00'
                        type='number'
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        size='md'
                      />
                    </Box>
                  </HStack>
                </VStack>
                {cart.map(line => (
                  <Box key={line.id} borderWidth='1px' borderRadius='10px' p='14px' bg={useColorModeValue('gray.50', 'gray.800')}>
                    <HStack justify='space-between' mb='12px'>
                      <VStack align='flex-start' spacing='4px' flex='1'>
                        <Text fontWeight='semibold' fontSize='sm'>{line.name}</Text>
                        {line.serial_id && (
                          <Text fontSize='xs' color='gray.500'>Serial: {line.serial_id}</Text>
                        )}
                      </VStack>
                      <IconButton
                        size='sm'
                        aria-label='remove'
                        icon={<FaTrash />}
                        variant='ghost'
                        color='red.400'
                        onClick={() => removeLine(line.id)}
                      />
                    </HStack>
                    {line.secondaryUnit && line.secondaryPerPrimary && line.secondaryPerPrimary > 0 && (
                      <HStack mb='8px' spacing='8px'>
                        <Text fontSize='xs' color='gray.600' minW='80px'>Sell in:</Text>
                        <Select
                          size='sm'
                          value={line.unitType || 'primary'}
                          onChange={(e) => {
                            const newUnitType = e.target.value;
                            const product = items.find(it => it.id === line.id);
                            // Always get the original primary unit price from product catalog
                            // This ensures we always convert from the correct base price
                            const basePricePrimary = product?.price || getBasePrice(line);
                            let newPrice;
                            let newQty = line.qty;

                            // Adjust price and quantity based on unit type conversion
                            // Always calculate from the original primary unit price to avoid accumulation errors
                            if (line.secondaryPerPrimary && line.secondaryPerPrimary > 0) {
                              if (newUnitType === 'secondary') {
                                // Switching to secondary: multiply quantity, divide primary price
                                newQty = line.qty * line.secondaryPerPrimary;
                                newPrice = basePricePrimary / line.secondaryPerPrimary;
                              } else {
                                // Switching to primary: divide quantity, use primary price directly
                                newQty = line.qty / line.secondaryPerPrimary;
                                newPrice = basePricePrimary;
                              }
                            } else {
                              // No conversion, use primary price
                              newPrice = basePricePrimary;
                            }

                            setCart(prev => prev.map(x => x.id === line.id
                              ? { ...x, unitType: newUnitType, price: newPrice, basePrice: basePricePrimary, qty: newQty }
                              : x));
                          }}
                          width='150px'
                        >
                          <option value='primary'>{line.primaryUnit || 'Primary'}</option>
                          <option value='secondary'>{line.secondaryUnit || 'Secondary'}</option>
                        </Select>
                        <Text fontSize='xs' color='gray.500'>
                          {line.unitType === 'secondary' && line.secondaryPerPrimary
                            ? `1 ${line.secondaryUnit} = ${(1 / line.secondaryPerPrimary).toFixed(4)} ${line.primaryUnit}`
                            : line.unitType === 'primary' && line.secondaryPerPrimary
                              ? `1 ${line.primaryUnit} = ${line.secondaryPerPrimary} ${line.secondaryUnit}`
                              : ''}
                        </Text>
                      </HStack>
                    )}
                    <HStack justify='space-between' mb='12px' spacing='12px'>
                      <HStack spacing='8px'>
                        <Text fontSize='xs' color='gray.600' minW='60px'>Quantity:</Text>
                        <IconButton size='sm' icon={<FaMinus />} onClick={() => changeQty(line.id, -1)} />
                        <Text minW='32px' textAlign='center' fontWeight='semibold'>
                          {line.qty} {line.unitType === 'secondary' ? line.secondaryUnit : line.primaryUnit}
                        </Text>
                        <IconButton size='sm' icon={<FaPlus />} onClick={() => changeQty(line.id, 1)} />
                      </HStack>
                      <VStack align='flex-end' spacing='4px' flex='1'>
                        <HStack spacing='8px' justify='flex-end' w='100%'>
                          <Text fontSize='xs' color='gray.600' whiteSpace='nowrap'>Unit Price:</Text>
                          <Input
                            width='120px'
                            type='number'
                            step='0.01'
                            value={line.price}
                            onChange={(e) => {
                              const val = Number(e.target.value || 0);
                              setCart(prev => prev.map(x => x.id === line.id
                                ? { ...x, basePrice: getBasePrice(x), price: val }
                                : x));
                            }}
                            placeholder='0.00'
                            size='sm'
                          />
                          <Text fontWeight='semibold' minW='80px' textAlign='right'>
                            PKR {(line.qty * line.price).toFixed(2)}
                          </Text>
                        </HStack>
                        {(() => {
                          // Get base price in primary units (per bag)
                          const basePricePrimary = getBasePrice(line);
                          // Convert base price to current unit type for comparison
                          let basePriceInCurrentUnit = basePricePrimary;
                          if (line.unitType === 'secondary' && line.secondaryPerPrimary && line.secondaryPerPrimary > 0) {
                            // Convert primary unit price to secondary unit price
                            basePriceInCurrentUnit = basePricePrimary / line.secondaryPerPrimary;
                          }

                          // Get cost (last purchase price) and convert to current unit type
                          const cost = Number(line.cost || 0);
                          let costInCurrentUnit = cost;
                          if (line.unitType === 'secondary' && line.secondaryPerPrimary && line.secondaryPerPrimary > 0) {
                            costInCurrentUnit = cost / line.secondaryPerPrimary;
                          }
                          const hasCogsLoss = costInCurrentUnit > 0 && line.price < costInCurrentUnit;
                          const cogsLossPerUnit = hasCogsLoss ? costInCurrentUnit - line.price : 0;
                          const totalCogsLoss = cogsLossPerUnit * line.qty;

                          // Calculate profit from cost
                          const profitFromCost = costInCurrentUnit > 0 ? line.price - costInCurrentUnit : 0;
                          const totalProfitFromCost = profitFromCost * line.qty;

                          // Check for discount (selling below base/selling price)
                          const hasDiscount = basePriceInCurrentUnit > line.price;
                          const discountPerUnit = hasDiscount ? basePriceInCurrentUnit - line.price : 0;
                          const totalDiscount = discountPerUnit * line.qty;

                          return (
                            <VStack align='stretch' spacing='2px' fontSize='xs' color='gray.500'>
                              {/* Always show cost price */}
                              {costInCurrentUnit > 0 && (
                                <HStack spacing='4px'>
                                  <Text>Cost:</Text>
                                  <Text fontWeight='medium' color={textColor}>PKR {costInCurrentUnit.toFixed(2)}</Text>
                                  {profitFromCost > 0 && (
                                    <>
                                      <Text>•</Text>
                                      <Text color='green.500' fontWeight='medium'>Profit: PKR {totalProfitFromCost.toFixed(2)}</Text>
                                    </>
                                  )}
                                  {hasCogsLoss && (
                                    <>
                                      <Text>•</Text>
                                      <Text color='red.500' fontWeight='bold'>Loss: PKR {totalCogsLoss.toFixed(2)}</Text>
                                    </>
                                  )}
                                </HStack>
                              )}
                              {/* Show discount if selling below base price */}
                              {hasDiscount && (
                                <HStack spacing='4px'>
                                  <Text>Original:</Text>
                                  <Text textDecoration='line-through'>PKR {basePriceInCurrentUnit.toFixed(2)}</Text>
                                  <Text>•</Text>
                                  <Text color='orange.500' fontWeight='medium'>Discount: PKR {totalDiscount.toFixed(2)}</Text>
                                </HStack>
                              )}
                              {/* Show profit from base price if selling above base and no cost info */}
                              {!costInCurrentUnit && line.price > basePriceInCurrentUnit && (
                                <HStack spacing='4px' color='green.500'>
                                  <Text>Base:</Text>
                                  <Text>PKR {basePriceInCurrentUnit.toFixed(2)}</Text>
                                  <Text>•</Text>
                                  <Text fontWeight='medium'>Profit: PKR {((line.price - basePriceInCurrentUnit) * line.qty).toFixed(2)}</Text>
                                </HStack>
                              )}
                            </VStack>
                          );
                        })()}
                      </VStack>
                    </HStack>
                    <HStack justify='space-between' pt='8px' borderTopWidth='1px' borderColor={useColorModeValue('gray.200', 'gray.600')}>
                      <Text fontSize='xs' color='gray.600' whiteSpace='nowrap'>Hidden Cost:</Text>
                      <HStack spacing='8px'>
                        <Input
                          width='120px'
                          type='number'
                          step='0.01'
                          value={line.hiddenCost ?? ''}
                          onChange={(e) => {
                            const val = Number(e.target.value || 0);
                            setCart(prev => prev.map(x => x.id === line.id
                              ? { ...x, hiddenCost: val }
                              : x));
                          }}
                          placeholder='0.00'
                          size='sm'
                        />
                        <Text color='orange.500' fontWeight='medium' minW='80px' textAlign='right'>
                          + PKR {Number(line.hiddenCost || 0).toFixed(2)}
                        </Text>
                      </HStack>
                    </HStack>
                  </Box>
                ))}
                {cart.length === 0 && (
                  <Box textAlign='center' py='40px'>
                    <Text color='gray.500' fontSize='sm'>Cart is empty</Text>
                  </Box>
                )}
                {cart.length > 0 && (
                  <Box borderTopWidth='2px' borderColor={useColorModeValue('gray.200', 'gray.600')} pt='16px'>
                    <VStack align='stretch' spacing='8px' mb='12px'>
                      <HStack justify='space-between'>
                        <Text fontSize='sm' color='gray.600'>Discount:</Text>
                        <Text fontSize='sm' color='gray.600' fontWeight='medium'>PKR {totalDiscount.toFixed(2)}</Text>
                      </HStack>
                      {manualDiscount > 0 && (
                        <Text fontSize='xs' color='gray.500' pl='16px'>
                          (Includes PKR {manualDiscount.toFixed(2)} from price adjustments)
                        </Text>
                      )}
                      {hiddenCostsAmount > 0 && (
                        <HStack justify='space-between'>
                          <Text color='orange.500' fontSize='sm'>Hidden Costs:</Text>
                          <Text color='orange.500' fontSize='sm' fontWeight='medium'>PKR {hiddenCostsAmount.toFixed(2)}</Text>
                        </HStack>
                      )}
                      {cogsLoss > 0 && (
                        <HStack justify='space-between'>
                          <Text color='red.500' fontSize='sm' fontWeight='semibold'>COGS Loss (Below Cost):</Text>
                          <Text color='red.500' fontSize='sm' fontWeight='bold'>PKR {cogsLoss.toFixed(2)}</Text>
                        </HStack>
                      )}
                    </VStack>
                    <Box pt='12px' borderTopWidth='1px' borderColor={useColorModeValue('gray.200', 'gray.600')}>
                      <HStack justify='space-between'>
                        <Text fontWeight='bold' fontSize='lg' color={textColor}>Total:</Text>
                        <Text fontWeight='bold' fontSize='lg' color={textColor}>PKR {total.toFixed(2)}</Text>
                      </HStack>
                    </Box>
                  </Box>
                )}
                {/* Payment at checkout */}
                {cart.length > 0 && (
                  <VStack align='stretch' spacing='14px' pt='8px' borderTopWidth='2px' borderColor={useColorModeValue('gray.200', 'gray.600')}>
                    {paymentMode === 'split' ? (
                      <Box fontSize='sm' color='gray.600' p='12px' bg={useColorModeValue('blue.50', 'blue.900')} borderRadius='8px'>
                        <Text fontWeight='medium' mb='4px'>Split Payment Total: PKR {splitPaidTotal.toFixed(2)}</Text>
                        <Text fontSize='xs' color='gray.500'>Split payments are applied immediately to this invoice.</Text>
                        {!customerId && splitPaidTotal < remainingAfterAdvance && (
                          <Box
                            mt='8px'
                            p='8px'
                            borderRadius='6px'
                            bg={useColorModeValue('red.50', 'red.900')}
                            borderWidth='1px'
                            borderColor={useColorModeValue('red.200', 'red.700')}
                          >
                            <Text color='red.700' fontSize='xs' fontWeight='semibold' mb='2px'>
                              ⚠️ Guest customers cannot have due balance
                            </Text>
                            <Text color='red.600' fontSize='xs'>
                              Please add this customer to enable due balance tracking.
                            </Text>
                          </Box>
                        )}
                        {customerId && splitPaidTotal < remainingAfterAdvance && (
                          <Text color='orange.500' fontSize='xs' mt='4px'>Remaining balance will stay as due until settled.</Text>
                        )}
                      </Box>
                    ) : (
                      <Box>
                        <Text fontSize='xs' color='gray.600' mb='4px'>Paid Amount (optional)</Text>
                        <Input
                          placeholder='0.00'
                          type='number'
                          step='0.01'
                          value={paidAmount}
                          onChange={(e) => setPaidAmount(e.target.value)}
                          size='md'
                        />
                      </Box>
                    )}
                    <Box>
                      <Text fontSize='xs' color='gray.600' mb='4px'>Due Date (Optional)</Text>
                      <Input
                        type='date'
                        placeholder='Due date'
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        size='md'
                      />
                    </Box>
                    {!customerId && estimatedDue > 0 && (
                      <Box
                        p='12px'
                        borderRadius='8px'
                        bg={useColorModeValue('red.50', 'red.900')}
                        borderWidth='1px'
                        borderColor={useColorModeValue('red.200', 'red.700')}
                      >
                        <Text fontSize='sm' fontWeight='semibold' color='red.700' mb='4px'>
                          ⚠️ Guest customers cannot have due balance
                        </Text>
                        <Text fontSize='xs' color='red.600'>
                          Please add this customer to the system to enable due balance tracking. Guest customers must pay the full amount.
                        </Text>
                      </Box>
                    )}
                    {customerId && (
                      <Box fontSize='sm' color='gray.600' p='12px' bg={useColorModeValue('gray.50', 'gray.800')} borderRadius='8px'>
                        <VStack align='stretch' spacing='6px'>
                          {existingAdvance > 0 && (
                            <HStack justify='space-between'>
                              <Text fontSize='xs'>Customer Advance:</Text>
                              <Text fontSize='xs' fontWeight='medium'>PKR {existingAdvance.toFixed(2)}</Text>
                            </HStack>
                          )}

                          {applyAdvanceEffective && (
                            <HStack justify='space-between'>
                              <Text fontSize='xs'>Will Apply from Advance:</Text>
                              <HStack>
                                <Input
                                  size='xs'
                                  width='80px'
                                  type='number'
                                  textAlign='right'
                                  placeholder={maxAdvanceToApply.toFixed(2)}
                                  value={customAdvanceAmount}
                                  onChange={(e) => setCustomAdvanceAmount(e.target.value)}
                                />
                                <Text fontSize='xs' fontWeight='medium'>/ {maxAdvanceToApply.toFixed(2)}</Text>
                              </HStack>
                            </HStack>
                          )}
                          {paymentMode === 'split' ? (
                            <HStack justify='space-between'>
                              <Text fontSize='xs'>Split Applied Now:</Text>
                              <Text fontSize='xs' fontWeight='medium'>
                                Cash PKR {Number(splitPayments.cash.amount || 0).toFixed(2)} + Online PKR {Number(splitPayments.online.amount || 0).toFixed(2)}
                              </Text>
                            </HStack>
                          ) : paymentAs === 'payment' ? (
                            <>
                              <HStack justify='space-between'>
                                <Text fontSize='xs'>Paid to Invoice:</Text>
                                <Text fontSize='xs' fontWeight='medium'>PKR {Math.min(totalPaid, total).toFixed(2)}</Text>
                              </HStack>
                              {excessPaid > 0 && (
                                <HStack justify='space-between'>
                                  <Text fontSize='xs'>Excess to Advance:</Text>
                                  <Text fontSize='xs' fontWeight='medium' color='orange.500'>PKR {excessPaid.toFixed(2)}</Text>
                                </HStack>
                              )}
                            </>
                          ) : (
                            <HStack justify='space-between'>
                              <Text fontSize='xs'>Stored as Advance:</Text>
                              <Text fontSize='xs' fontWeight='medium'>PKR {payNow.toFixed(2)}</Text>
                            </HStack>
                          )}
                          {paymentAs === 'advance' && paymentMode !== 'split' && (
                            <Text fontSize='xs' color='gray.500' fontStyle='italic'>
                              Invoice remains due until the stored advance is applied later.
                            </Text>
                          )}
                          <Box pt='8px' borderTopWidth='1px' borderColor={useColorModeValue('gray.200', 'gray.600')}>
                            <HStack justify='space-between' mb='4px'>
                              <Text fontSize='sm' fontWeight='semibold'>Estimated Due:</Text>
                              <Text fontSize='sm' fontWeight='semibold' color='red.500'>PKR {estimatedDue.toFixed(2)}</Text>
                            </HStack>
                            <HStack justify='space-between'>
                              <Text fontSize='sm' fontWeight='semibold'>Estimated New Advance:</Text>
                              <Text fontSize='sm' fontWeight='semibold' color='green.500'>PKR {estimatedNewAdvance.toFixed(2)}</Text>
                            </HStack>
                          </Box>
                        </VStack>
                      </Box>
                    )}
                    <VStack spacing='8px' align='stretch'>
                      <Button
                        bg='#FF8D28'
                        color='white'
                        _hover={{ bg: '#E67E22' }}
                        onClick={generateInvoice}
                        isDisabled={cart.length === 0 || checkoutLoading || (!customerId && estimatedDue > 0)}
                        isLoading={checkoutLoading}
                        loadingText={reservationMode === 'reserve' ? 'Saving reservation...' : 'Processing...'}
                        size='lg'
                        height='48px'
                        fontSize='md'
                        fontWeight='bold'>
                        {reservationMode === 'reserve' ? 'Reserve Stock & Record Advance' : `Checkout - PKR ${total.toFixed(2)}`}
                      </Button>
                      {lastReservationMeta?.id && (
                        <Button
                          variant='outline'
                          colorScheme='purple'
                          onClick={() => triggerReservationReceiptPrint(lastReservationMeta.id)}
                          isLoading={reservationPrintLoading}
                          loadingText='Preparing receipt...'
                        >
                          {`Print reservation receipt ${lastReservationMeta.reference ? `(${lastReservationMeta.reference})` : ''}`}
                        </Button>
                      )}
                      {lastInvoiceMeta?.id && (
                        <Button
                          variant='outline'
                          colorScheme='gray'
                          onClick={() => triggerInvoicePrint(lastInvoiceMeta.id)}
                          isLoading={printLoading}
                          loadingText='Preparing print...'
                        >
                          {`Print invoice ${lastInvoiceMeta.number ? `(${lastInvoiceMeta.number})` : ''}`}
                        </Button>
                      )}
                    </VStack>
                  </VStack>
                )}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Flex>
  );
}


