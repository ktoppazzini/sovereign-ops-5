'use client'
import { useState, useEffect } from 'react'
import translations from '../translations'

export default function Home() {
  const [status, setStatus] = useState('')
  const [lang, setLang] = useState('en')
  const [countries, setCountries] = useState([])
  const [tiers, setTiers] = useState([])
  const [sizes, setSizes] = useState([])

  const t = translations[lang]

  useEffect(() => {
    async function fetchOptions() {
      const resCountries = await fetch('/api/options/countries')
      const resTiers = await fetch('/api/options/tiers')
      const resSizes = await fetch('/api/options/company-sizes')

      const countriesData = await resCountries.json()
      const tiersData = await resTiers.json()
      const sizesData = await resSizes.json()

      setCountries(countriesData.options || [])
      setTiers(tiersData.options || [])
      setSizes(sizesData.options || []);
