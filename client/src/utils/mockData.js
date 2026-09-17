import { createCategory } from '../api/categories';
import { createTransaction } from '../api/transactions';
import { createInvestment } from '../api/investments';
import { updateProfile } from '../api/profile';

export const populateMockData = async () => {
    try {
        // 1. Create Categories
        const categoriesData = [
            { name: "Salário" },
            { name: "Alimentação" },
            { name: "Transporte" },
            { name: "Lazer" },
            { name: "Moradia" }
        ];

        const createdCategories = {};
        for (const cat of categoriesData) {
            const created = await createCategory(cat);
            createdCategories[cat.name] = created.id;
        }

        // 2. Helper to get a date shifted by X days
        const getRelativeDate = (daysAgo) => {
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            return date.toISOString().split('T')[0]; // YYYY-MM-DD
        };

        // 3. Create Transactions
        const transactionsData = [
            { description: "Salário Empresa", amount: 8500.00, date: getRelativeDate(2), type: "income", category_id: createdCategories["Salário"] },
            { description: "Supermercado Extra", amount: 450.50, date: getRelativeDate(1), type: "expense", category_id: createdCategories["Alimentação"] },
            { description: "Uber", amount: 35.00, date: getRelativeDate(0), type: "expense", category_id: createdCategories["Transporte"] },
            { description: "Cinema e Pipoca", amount: 120.00, date: getRelativeDate(4), type: "expense", category_id: createdCategories["Lazer"] },
            { description: "Aluguel", amount: 2500.00, date: getRelativeDate(5), type: "expense", category_id: createdCategories["Moradia"] },
            { description: "Restaurante Fim de Semana", amount: 180.00, date: getRelativeDate(3), type: "expense", category_id: createdCategories["Alimentação"] },
            { description: "Freelance", amount: 1200.00, date: getRelativeDate(10), type: "income", category_id: createdCategories["Salário"] },
            { description: "Gasolina", amount: 200.00, date: getRelativeDate(7), type: "expense", category_id: createdCategories["Transporte"] },
            { description: "Conta de Luz", amount: 150.00, date: getRelativeDate(6), type: "expense", category_id: createdCategories["Moradia"] }
        ];

        for (const t of transactionsData) {
            await createTransaction(t);
        }

        // 4. Create Investments
        const investmentsData = [
            { name: "Petrobras", symbol: "PETR4", quantity: 100, price: 38.50, currency: "BRL", notes: "Mocked", purchase_date: getRelativeDate(30), type: "stock" },
            { name: "Vale", symbol: "VALE3", quantity: 50, price: 62.10, currency: "BRL", notes: "Mocked", purchase_date: getRelativeDate(60), type: "stock" },
            { name: "Maxi Renda FII", symbol: "MXRF11", quantity: 500, price: 10.50, currency: "BRL", notes: "Mocked", purchase_date: getRelativeDate(15), type: "fund" }
        ];

        for (const inv of investmentsData) {
            await createInvestment(inv);
        }

        // 5. Update profile to mark as populated
        await updateProfile({ hasPopulatedMockData: true });

        return true;
    } catch (error) {
        console.error("Error populating mock data:", error);
        throw error;
    }
};
