import { useState } from 'react';
import { toast } from 'sonner';
import { expenseService } from '../services/expenseService';

/**
 * Shared hook that provides expense edit/delete handlers.
 * Eliminates the copy-paste between TripOverviewPage and ExpenseListPage.
 *
 * @param {string} tripId
 * @returns {{ handleEditExpense, handleDeleteExpense, handleConfirmDelete, expenseToEdit, expenseToDelete, setExpenseToDelete }}
 */
export function useExpenseActions(tripId) {
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const handleEditExpense = (expense) => {
    setExpenseToEdit(expense);
  };

  const handleDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    const expenseId = expenseToDelete.id;
    setExpenseToDelete(null);
    try {
      await expenseService.deleteExpense(tripId, expenseId);
      toast.success('Expense deleted!');
    } catch (e) {
      toast.error('Failed to delete expense');
      console.error(e);
    }
  };

  return {
    expenseToEdit,
    setExpenseToEdit,
    expenseToDelete,
    setExpenseToDelete,
    handleEditExpense,
    handleDeleteExpense,
    handleConfirmDelete,
  };
}
