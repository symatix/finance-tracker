export const formatCurrency = (value: number, locale: string = 'en-EU', currency: string = 'EUR') =>
	value.toLocaleString(locale, {
		style: 'currency',
		currency: currency,
		minimumFractionDigits: 2,
	});
