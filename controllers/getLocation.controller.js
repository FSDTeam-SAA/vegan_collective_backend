const express = require('express');
const axios = require("axios");

// const getLocation = async (req, res) =>{
//     try {
//         let ip = req.headers['x-forwarded-for']?.split(',')[0] || req.connection?.remoteAddress
//         const IPINFO_TOKEN = "b2430edbec4ac8";

//         console.log(IPINFO_TOKEN)
//         if (ip === '::1' || ip === '127.0.0.1') {
//             ip = '24.48.0.1	'; // Google Public DNS (used for testing)
//           }
//         console.log(ip)
//         const geoResponse = await axios.get(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`);
//         const { country, city } = geoResponse.data;

//         return res.status(200).json({
//             success: true,
//             ip : ip,
//             country: country,
//             city: city,
//           });

//     } catch (error) {
//         return res.status(500).json({
//             status: "error",
//             message: "Unable to get location!"
//         });
//     }
// }

const getLocation = async (req, res) => {
    try {
        let ip = req.headers['x-forwarded-for']?.split(',')[0] || req.connection?.remoteAddress;

        const IPINFO_TOKEN = "b2430edbec4ac8";

        if (ip === '::1' || ip === '127.0.0.1') {
            ip = '24.48.0.1';  //canada
        }

        const geoResponse = await axios.get(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`);
        const { country, city, region } = geoResponse.data;

        const mappedRegion = mapCountryToCustomRegion(country);

        return res.status(200).json({
            success: true,
            ip,
            country,
            city,
            region,
            mappedRegion
        });

    } catch (error) {
        console.error("Location error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to get location!"
        });
    }
};

function mapCountryToCustomRegion(countryName) {
    const name = countryName.toLowerCase();

    if (name === 'us' || name.includes('united states')) return 'usa';
    if (name === 'ca' || name.includes('canada')) return 'canada';
    if (name === 'mx' || name.includes('mexico')) return 'mexico';

    const northernEuropeCountries = [
        'england',
        'germany',
        'netherlands',
        'denmark',
        'sweden',
        'scotland'
    ];
    if (northernEuropeCountries.includes(name)) return 'neurope';

    const australasiaCountries = ['australia', 'new zealand', 'fiji', 'papua new guinea'];
    if (australasiaCountries.includes(name)) return 'australasia';

    return 'other'; 
}

module.exports = getLocation;