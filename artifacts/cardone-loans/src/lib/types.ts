import { Application } from "@workspace/api-client-react"

// Extended Application type with new backend fields
export interface ExtendedApplication extends Omit<Application, never> {
  approvedAmount?: number | null
  releaseDate?: string | null
  isReleased?: boolean
  availableBalance?: number
  processingFeeKes?: number | null
  paymentStatus?: string | null
  mpesaCheckoutRequestId?: string | null
  documentPaths?: Array<{ type: string; name: string; path: string }>
  payoutBankCountry?: string | null
  payoutBankName?: string | null
  payoutBankAccountNumber?: string | null
  payoutBankAccountName?: string | null
  payoutSwiftCode?: string | null
  userEmail?: string
  userFullName?: string
}
