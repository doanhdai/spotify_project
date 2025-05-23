import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPremium } from '@/service/apiService';
import { useTranslation } from 'react-i18next';

const PurchasedPremiumCard = ({ title, price, duration, descriptions, package_id, is_premiumCard }) => {
    const navigate = useNavigate();
    const is_premium = localStorage.getItem('is_premium') === 'true';
    const { t } = useTranslation();
    const handleBuyClick = () => {
        if (!is_premium) {
            navigate(`/premium/register/${package_id}/`);
        }
    };

    return (
        <div className="relative mb-6 w-full max-w-sm bg-gray-800 text-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105">
            {/* Premium Badge */}
            {is_premiumCard === 'completed' && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-black px-3 py-1 text-xs font-bold rounded-bl-xl">
                    {t('premium.premium_badge')}
                </div>
            )}

            <div className="bg-gradient-to-r from-green-400 to-blue-500 p-4 text-center font-bold text-black">
                <span className="text-lg">{title}</span>
            </div>

            <div className="p-6">
                <h2 className="text-2xl font-bold text-center mb-4">{title}</h2>
                <p className="text-center text-lg font-semibold text-green-400">
                    {price} / {duration}
                </p>
                <p className="text-center text-lg font-semibold text-green-400">{descriptions}</p>

                <div className="mt-6 text-center">
                    <button
                        onClick={handleBuyClick}
                        className={`w-full py-3 ${
                            is_premiumCard === 'completed'
                                ? 'bg-gray-500 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600'
                        } text-white font-semibold rounded-lg shadow-md transition-all`}
                        disabled={is_premiumCard === 'completed'}
                    >
                        {is_premiumCard === 'completed' ? t('premium.premium_badge') : t('premium.premium_badge1')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const PremiumSection = () => {
    const userId = localStorage.getItem('id_user');
    const [premium, setPremium] = useState([]);
    const { t } = useTranslation();

    const fetchAllPremium = async () => {
        try {
            const respone = await getAllPremium(userId);
            setPremium(respone.data);
            console.log(respone.data);
        } catch (error) {
            console.error(error);
        }
    };

    const formatPrice = (price) => {
        return Number(price).toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
        });
    };

    useEffect(() => {
        fetchAllPremium();
    }, []);

    return (
        <div className="bg-black w-full h-100 px-2 py-2">
            <div className="w-full bg-[#141414] rounded-xl">
                {/* Banner */}
                <div
                    className="flex flex-col justify-center rounded-xl"
                    style={{
                        backgroundImage:
                            'linear-gradient(to bottom, #141414 9%, #590F33 30%, #9C0B50 48%, #521030 72%, #141414 90%)',
                        height: '250px',
                    }}
                >
                    <h1 className="text-3xl ml-10 font-bold mb-3 text-white">{t('premium.premium_title')}</h1>
                    <p className="text-lg ml-10 text-gray-300">{t('premium.premium_description')}</p>
                </div>

                {/* Premium Cards */}
                <div className="flex flex-wrap gap-6 justify-center mt-8 px-4">
                    {premium.map((item, index) => (
                        <PurchasedPremiumCard
                            key={index}
                            package_id={item.premium?.id}
                            is_premiumCard={item.latest_payment?.status}
                            title={item.premium?.ten_premium}
                            price={formatPrice(item.premium?.gia_ban)}
                            duration={`${item.premium?.thoi_han} ngày`}
                            descriptions={item.premium?.mo_ta || ''}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PremiumSection;
