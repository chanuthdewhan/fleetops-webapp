import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/hooks/useCustomers";
import { customerSchema, type CustomerForm } from "@/schemas/customerSchema";
import type { Customer } from "@/types";

export default function CustomersPage() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useCustomers(page);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const customers = data?.content ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerForm>({ resolver: zodResolver(customerSchema) });

  const filteredCustomers = useMemo(() => {
    if (!customers.length) return [];
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.address.toLowerCase().includes(q),
    );
  }, [customers, search]);

  const openCreateDialog = () => {
    setEditingCustomer(null);
    reset({ name: "", phone: "", email: "", address: "" });
    setOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    reset({
      name: customer.name,
      phone: customer.phone,
      email: customer.email ?? "",
      address: customer.address,
    });
    setOpen(true);
  };

  const onSubmit = (data: CustomerForm) => {
    if (editingCustomer) {
      updateCustomer.mutate(
        { id: editingCustomer.id, data },
        {
          onSuccess: () => {
            toast.success("Customer updated");
            setOpen(false);
          },
          onError: (err: any) =>
            toast.error(
              err.response?.data?.detail ?? "Failed to update customer",
            ),
        },
      );
    } else {
      createCustomer.mutate(data, {
        onSuccess: () => {
          toast.success("Customer created");
          setOpen(false);
        },
        onError: (err: any) =>
          toast.error(
            err.response?.data?.detail ?? "Failed to create customer",
          ),
      });
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteCustomer.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Customer deleted");
        setDeleteTarget(null);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.detail ?? "Failed to delete customer");
        setDeleteTarget(null);
      },
    });
  };

  const isSaving = createCustomer.isPending || updateCustomer.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Customers</h1>
          {data && <Badge variant="secondary">{data.totalElements}</Badge>}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                New Customer
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? "Edit Customer" : "New Customer"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
                {errors.phone && (
                  <p className="text-sm text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input id="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register("address")} />
                {errors.address && (
                  <p className="text-sm text-destructive">
                    {errors.address.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving
                  ? "Saving..."
                  : editingCustomer
                    ? "Save Changes"
                    : "Create Customer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border bg-background p-4 shadow-sm space-y-4">
        {!isLoading && customers.length > 0 && (
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredCustomers.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.email || "—"}</TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(customer)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(customer)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              page={page}
              totalPages={data?.totalPages ?? 0}
              onPageChange={setPage}
            />
          </>
        ) : (
          <EmptyState
            title={search ? "No matches found" : "No customers yet"}
            description={
              search
                ? "Try a different search term."
                : "Create your first customer to get started."
            }
          />
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete customer"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        isLoading={deleteCustomer.isPending}
      />
    </div>
  );
}
