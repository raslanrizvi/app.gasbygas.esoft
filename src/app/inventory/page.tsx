'use client';

import AppLayout from '@/components/layouts/AppLayout';
import Modal from '@/components/modal';
import Button from '@/components/subcomponents/button';
import Input from '@/components/subcomponents/input';
import { Table } from '@/components/table';
import { Dispatch, RootState } from '@/data';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export default function Inventory() {
    const dispatch = useDispatch<Dispatch>();
    const { currentStock, history = [] } = useSelector((state: RootState) => state.inventory)

    useEffect(() => {
        dispatch.inventory.fetchInventory();
    }, [])

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [formData, setFormData] = useState({ quantity: 0, dateAdded: moment().format('YYYY-MM-YY') });
    const [formErrors, setFormErrors] = useState({ quantity: '', dateAdded: '' });

    const handleAddInventory = () => {
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setFormData({ quantity: 0, dateAdded: '' });
        setFormErrors({ quantity: '', dateAdded: '' });
        setIsPopupOpen(false);
    };

    const handleChangeField = (field: string, val: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: field === 'quantity' ? parseInt(val):  val,
        }));
    };

    const validateForm = () => {
        const errors = { quantity: '', dateAdded: '' };
        let isValid = true;

        if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
            errors.quantity = 'Please enter a valid quantity';
            isValid = false;
        }

        if (!formData.dateAdded) {
            errors.dateAdded = 'Please select a valid date';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const data = await dispatch.inventory.createInventory(formData);

            toast.success(data?.message || "Inventory has been updated successfully")
            dispatch.inventory.fetchInventory()

            handleClosePopup();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Unknown error occurred!")
            console.log('Create inventory failed:', error);
        } finally {
            setIsLoading(false);
        }

        
        handleClosePopup();
    };

    const columns = [
        { key: 'dateAdded', label: 'Date Added', render: (inv: any) => moment(inv.dateAdded).format('YYYY-MM-DD') },
        { key: 'quantity', label: 'Quantity' },
    ];

    return (
        <AppLayout>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-800 p-4">
                <h1 className="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-200">Inventory Management</h1>

                {/* Current Stock Card */}
                <div className="bg-blue-100 dark:bg-blue-800 p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-lg font-bold text-gray-700 dark:text-gray-100">Current Gas Cylinders Stock</h2>
                    <p className="text-4xl font-extrabold text-blue-700 dark:text-blue-300">{currentStock}</p>
                    <Button
                        text='Add Inventory'
                        onClick={handleAddInventory}
                    />
                </div>

                {/* History Table */}
                <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200">Inventory History</h2>
                <Table columns={columns} data={history} />

                {/* Add Inventory Popup */}
                <Modal isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
                    <Modal.Header>Add Inventory</Modal.Header>
                    <Modal.Content>
                        <div className="mb-4">
                            <Input id='' type='number'
                                error={formErrors.quantity}
                                min={0}
                                value={formData.quantity} label='Qunatity' onChange={handleChangeField.bind(null, 'quantity')} />

                        </div>
                        <div className="mb-4">
                            <Input id='' type='date'
                                error={formErrors.dateAdded}
                                value={formData.dateAdded} label='Date' onChange={handleChangeField.bind(null, 'dateAdded')} />
                        </div>
                    </Modal.Content>
                    <Modal.Footer>
                        <div className="flex justify-end gap-2">
                            <Button
                                color='secondary'
                                text='Cancel'
                                onClick={handleClosePopup}
                            />
                            <Button
                                isLoading={isLoading}
                                text='Submit'
                                onClick={handleSubmit}
                            />
                        </div>
                    </Modal.Footer>
                </Modal>
            </div>
        </AppLayout>
    );
}
