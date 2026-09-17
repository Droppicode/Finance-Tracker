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
            { name: "Moradia" },
            { name: "Saúde" },
            { name: "Educação" },
            { name: "Freelance" },
            { name: "Assinaturas" },
            { name: "Vestuário" }
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

        // 3. Create Transactions (Many more to fill the charts!)
        const transactionsData = [
            // Current Month
            { description: "Salário Empresa", amount: 8500.00, date: getRelativeDate(2), type: "income", category_id: createdCategories["Salário"] },
            { description: "Supermercado Extra", amount: 650.50, date: getRelativeDate(1), type: "expense", category_id: createdCategories["Alimentação"] },
            { description: "Uber", amount: 35.00, date: getRelativeDate(0), type: "expense", category_id: createdCategories["Transporte"] },
            { description: "Cinema e Pipoca", amount: 120.00, date: getRelativeDate(4), type: "expense", category_id: createdCategories["Lazer"] },
            { description: "Aluguel", amount: 2500.00, date: getRelativeDate(5), type: "expense", category_id: createdCategories["Moradia"] },
            { description: "Restaurante Fim de Semana", amount: 180.00, date: getRelativeDate(3), type: "expense", category_id: createdCategories["Alimentação"] },
            { description: "Netflix", amount: 45.90, date: getRelativeDate(2), type: "expense", category_id: createdCategories["Assinaturas"] },
            { description: "Spotify", amount: 21.90, date: getRelativeDate(1), type: "expense", category_id: createdCategories["Assinaturas"] },
            { description: "Gasolina", amount: 200.00, date: getRelativeDate(7), type: "expense", category_id: createdCategories["Transporte"] },
            { description: "Conta de Luz", amount: 150.00, date: getRelativeDate(6), type: "expense", category_id: createdCategories["Moradia"] },
            { description: "Farmácia", amount: 95.00, date: getRelativeDate(8), type: "expense", category_id: createdCategories["Saúde"] },
            { description: "Curso Udemy", amount: 39.90, date: getRelativeDate(9), type: "expense", category_id: createdCategories["Educação"] },
            { description: "Freelance App", amount: 1200.00, date: getRelativeDate(10), type: "income", category_id: createdCategories["Freelance"] },
            { description: "Roupas Renner", amount: 350.00, date: getRelativeDate(12), type: "expense", category_id: createdCategories["Vestuário"] },
            { description: "Ifood Hamburguer", amount: 75.00, date: getRelativeDate(15), type: "expense", category_id: createdCategories["Alimentação"] },
            { description: "Consulta Médica", amount: 300.00, date: getRelativeDate(18), type: "expense", category_id: createdCategories["Saúde"] },
            { description: "Internet Claro", amount: 120.00, date: getRelativeDate(20), type: "expense", category_id: createdCategories["Moradia"] },

            // Earlier in the Month (still within 30 days)
            { description: "Salário Empresa", amount: 8500.00, date: getRelativeDate(28), type: "income", category_id: createdCategories["Salário"] },
            { description: "Aluguel", amount: 2500.00, date: getRelativeDate(27), type: "expense", category_id: createdCategories["Moradia"] },
            { description: "Supermercado Carrefour", amount: 800.00, date: getRelativeDate(25), type: "expense", category_id: createdCategories["Alimentação"] },
            { description: "Gasolina", amount: 200.00, date: getRelativeDate(24), type: "expense", category_id: createdCategories["Transporte"] },
            { description: "Manutenção Carro", amount: 450.00, date: getRelativeDate(22), type: "expense", category_id: createdCategories["Transporte"] },
            { description: "Show Rock", amount: 250.00, date: getRelativeDate(21), type: "expense", category_id: createdCategories["Lazer"] },
            { description: "Mensalidade Faculdade", amount: 1500.00, date: getRelativeDate(29), type: "expense", category_id: createdCategories["Educação"] }
        ];

        for (const t of transactionsData) {
            await createTransaction(t);
        }

        // 4. Create Investments (Diverse portfolio - keep purchase_date <= 30 to show in default filters)
        const investmentsData = [
            // Ações Brasileiras (Stocks)
            { name: "Petrobras", symbol: "PETR4", quantity: 200, price: 34.50, currency: "BRL", notes: "Foco em dividendos", purchase_date: getRelativeDate(15), type: "stock" },
            { name: "Vale", symbol: "VALE3", quantity: 100, price: 65.10, currency: "BRL", notes: "Setor de mineração", purchase_date: getRelativeDate(20), type: "stock" },
            { name: "Itaú Unibanco", symbol: "ITUB4", quantity: 150, price: 32.20, currency: "BRL", notes: "Setor bancário", purchase_date: getRelativeDate(10), type: "stock" },
            { name: "WEG", symbol: "WEGE3", quantity: 50, price: 38.00, currency: "BRL", notes: "Crescimento a longo prazo", purchase_date: getRelativeDate(5), type: "stock" },
            
            // FIIs (Funds)
            { name: "Maxi Renda FII", symbol: "MXRF11", quantity: 1000, price: 10.20, currency: "BRL", notes: "Fundo de papel", purchase_date: getRelativeDate(25), type: "fund" },
            { name: "HGLG FII", symbol: "HGLG11", quantity: 50, price: 160.00, currency: "BRL", notes: "Fundo de galpões logísticos", purchase_date: getRelativeDate(28), type: "fund" },
            
            // BDRs (International Stocks)
            { name: "Apple", symbol: "AAPL34", quantity: 30, price: 85.00, currency: "BRL", notes: "Tecnologia", purchase_date: getRelativeDate(18), type: "bdr" },
            { name: "Microsoft", symbol: "MSFT34", quantity: 20, price: 95.50, currency: "BRL", notes: "Tecnologia e Cloud", purchase_date: getRelativeDate(22), type: "bdr" },

            // ETFs
            { name: "S&P 500 ETF", symbol: "IVVB11", quantity: 40, price: 290.00, currency: "BRL", notes: "Exposição ao mercado americano", purchase_date: getRelativeDate(26), type: "etf" },
            { name: "Ibovespa ETF", symbol: "BOVA11", quantity: 60, price: 125.00, currency: "BRL", notes: "Exposição à bolsa brasileira", purchase_date: getRelativeDate(27), type: "etf" },

            // Criptomoedas
            { name: "Bitcoin", symbol: "BTCBRL", quantity: 0.15, price: 300000.00, currency: "BRL", notes: "Reserva de valor", purchase_date: getRelativeDate(29), type: "criptomoedas" },
            { name: "Ethereum", symbol: "ETHBRL", quantity: 1.5, price: 15000.00, currency: "BRL", notes: "Smart contracts", purchase_date: getRelativeDate(29), type: "criptomoedas" }
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
