import { useState } from 'react';
import { X, Plus } from 'lucide-react';

import Input from '../shared/Input';
import Button from '../shared/Button';

export default function CategoryManager({ categories, onSelectCategory, onAddCategory, onRemoveCategory }) {
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    if (newCategory && onAddCategory) {
      onAddCategory(newCategory);
      setNewCategory('');
    }
  };

  return (
    <div className="absolute z-10 min-w-max bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
      <div className="max-h-40 overflow-y-auto mb-2">
        {(categories || []).map(c => (
          <div key={c.value} className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer" onClick={() => onSelectCategory(c.value)}>
            <span className="dark:text-white">{c.label}</span>
            <button onClick={(e) => { e.stopPropagation(); onRemoveCategory(c.value); }} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-4">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-2">
        <input 
          type="text" 
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Nova categoria"
          className="grow p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <Button onClick={handleAddCategory} variant="primary" size="icon">
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}