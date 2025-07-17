'use client'
import React, { useState, useEffect } from 'react';
import translations from '../translations';


useEffect(() => {
  async function fetchOptions() {
    const resCountries = await fetch('/api/options/countries', {
      headers: { 'Accept-Language': lang }
    });
    const countriesData = await resCountries.json();
    setCountries(countriesData.options || []);

    const resTiers = await fetch('/api/options/tiers', {
      headers: { 'Accept-Language': lang }
    });
    const tiersData = await resTiers.json();
    setTiers(tiersData.options || []);

    const resSizes = await fetch('/api/options/company-sizes');
    const sizesData = await resSizes.json();
    setSizes(sizesData.options || []);
  }
  fetchOptions();
}, [lang]);

