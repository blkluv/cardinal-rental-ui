import { TokenData } from 'api/api'
import React, { useState, useContext, useEffect, ReactChild } from 'react'
import { useRouter } from 'next/router'

export interface RentalCardOptions {
  invalidations: {
    showUsagesOption: boolean
    showExpirationOption: boolean
    showDurationOption: boolean
    showManualOption: boolean
  }
  invalidationOptions?: {
    durationCategories?: string[]
    invalidationCategories?: string[]
    paymentMints?: string[]
    setClaimRentalReceipt?: boolean
  }
}
export interface ProjectConfigValues {
  logoImage: string
  colors: { main: string; secondary: string }
  filters: { type: string; value: string }[]
  rentalCard: RentalCardOptions
  projectName: string
  configLoaded: boolean
}

const defaultMain = 'rgba(0, 0, 0, 0.15)'
const defaultSecondary = 'rgb(29, 155, 240)'

const ProjectConfigValues: React.Context<ProjectConfigValues> =
  React.createContext<ProjectConfigValues>({
    logoImage: '',
    colors: { main: '', secondary: '' },
    filters: [],
    projectName: '',
    configLoaded: false,
    rentalCard: {
      invalidations: {
        showUsagesOption: true,
        showExpirationOption: true,
        showDurationOption: true,
        showManualOption: true,
      },
    },
  })

export const filterTokens = (
  filters: { type: string; value: string }[],
  tokens: TokenData[]
): TokenData[] => {
  if (filters.length == 0) {
    // console.log('No filters')
  } else {
    filters.forEach((configFilter) => {
      if (configFilter.type === 'creators') {
        tokens = tokens.filter(
          (token) =>
            token.metadata.data.properties &&
            token.metadata.data.properties.creators.some(
              (creator: { address: string }) =>
                creator.address === configFilter.value
            )
        )
      } else if (configFilter.type == 'symbol') {
        tokens = tokens.filter(
          (token) => token.metadata.data.symbol == configFilter.value
        )
      }
    })
  }
  return tokens
}

export function getLink(path: string, withParams = true) {
  return `${window.location.origin}${path}${
    withParams
      ? path.includes('?') && window.location.search
        ? `${window.location.search.replace('?', '&')}`
        : window.location.search ?? ''
      : ''
  }`
}

export function ProjectConfigProvider({ children }: { children: ReactChild }) {
  const [logoImage, setLogoImage] = useState<string>('')
  const [colors, setColors] = useState<{ main: string; secondary: string }>({
    main: defaultMain,
    secondary: defaultSecondary,
  })
  const [filters, setFilters] = useState<{ type: string; value: string }[]>([])
  const [projectName, setProjectName] = useState<string>('')
  const [rentalCard, setRentalCard] = useState<RentalCardOptions>({
    invalidations: {
      showUsagesOption: true,
      showExpirationOption: true,
      showDurationOption: true,
      showManualOption: true,
    },
  })
  const [configLoaded, setConfigLoaded] = useState<boolean>(false)

  const { query } = useRouter()
  const projectParams = query.project || query.host
  const project =
    projectParams &&
    (typeof projectParams == 'string' ? projectParams : projectParams[0])
      ?.split('.')[0]
      ?.replace('dev-', '')

  const loadConfig = async () => {
    try {
      if (!project) return
      console.log(`Loading project config for ${project}`)
      const response = await fetch(`https://api.cardinal.so/config/${project}`)
      const jsonData = await response.json()
      setLogoImage(jsonData.logoImage)
      setColors(jsonData.colors)
      setFilters(jsonData.filters)
      setProjectName(jsonData.projectName)
      setRentalCard(jsonData.rentalCard)
      setConfigLoaded(true)
    } catch (e) {
      console.log('Error fetching project config', e)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [project])

  return (
    <ProjectConfigValues.Provider
      value={{
        logoImage,
        colors,
        filters,
        projectName,
        configLoaded,
        rentalCard,
      }}
    >
      {children}
    </ProjectConfigValues.Provider>
  )
}

export function useProjectConfigData(): ProjectConfigValues {
  return useContext(ProjectConfigValues)
}