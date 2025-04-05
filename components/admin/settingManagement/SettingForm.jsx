import React, { useEffect, useState } from 'react'
import CardForm from '../card/CardForm'
import Input from '../form/Input';
import SubmitButton from '../form/SubmitButton';
import { useFormValidation } from '../../../utils/FormValidation';
import { useLoading } from '../../../context/LoadingContext';
import { notifyError, notifyInfo, notifySuccess } from '../comman/notification/Notification';
import { useRouter } from 'next/router';
import { get, post } from '../../../utils/AxiosUtils';

const SettingForm = () => {
    const [formKey, setFormKey] = useState(0);
    const { loading, setLoading } = useLoading();
    const router = useRouter();

    const initialState = {
        color: '#967ADC',
        background: '#ffffff',
    };

    const validation = () => {
        let errors = {}
        if (!values.color) errors.color = 'Please enter system color';
        return errors;
    }

    const { formData: values, errors, handleChange, handleSubmit: validateSubmit, setFormData: setValues } = useFormValidation(initialState, validation);

    const handleSubmit = async (e) => {
        e.preventDefault();
        notifyInfo(values);
        validateSubmit(e);
        if (errors && Object.keys(errors).length > 0) {
            console.table(errors);
            return false;
        }
        setLoading(true)
        try {
            const res = await post(`/settings`, values);
            if (res) {
                setFormKey(res.data.id);
                notifySuccess(res.message)
                router.push('/admin/settings')
                window.location.reload();
            }
        } catch (err) {
            notifyError(err.message)
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [getSettingData] = await Promise.all([
                    get(`/settings`),
                ]);
                setValues(getSettingData?.data || {});
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
        // document.documentElement.style.setProperty('--light', values.color);
    }, [setValues]);

    return (
        <>
            <CardForm handleSubmit={handleSubmit} key={formKey}>
                <Input name={`color`} type='color' label="color" value={values?.color} onChange={handleChange} required={true} error={errors.color} inputType={true} disabled={false} />
                <Input name={`background`} type='color' label="theam background" value={values?.background} onChange={handleChange} required={true} error={errors.background} inputType={true} disabled={false} />
                <div className={`col-12`}>
                    <SubmitButton className={`custom`} name={loading ? 'Updating...' : 'Update Form'} />
                </div>
            </CardForm>
        </>
    )
}

export default SettingForm