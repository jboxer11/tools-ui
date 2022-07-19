import { Banner, BannerTheme, BottomSheet, ModalTitle } from '@pooltogether/react-components'
import { signERC2612Permit } from 'eth-permit'
import FeatherIcon from 'feather-icons-react'
import {
  delegationCreationsAtom,
  delegationCreationsCountAtom,
  delegationFundsAtom,
  delegationFundsCountAtom,
  delegationUpdatedLocksCountAtom,
  delegationUpdatesAtom,
  delegationUpdatesCountAtom,
  delegationUpdatesModalOpenAtom,
  delegationWithdrawalsAtom,
  delegationWithdrawlsCountAtom
} from '@twabDelegator/atoms'
import { useAtom } from 'jotai'
import { DelegationConfirmationList } from './DelegationConfirmationList'
import { useState } from 'react'
import { getTwabDelegatorContract } from '@twabDelegator/utils/getTwabDelegatorContract'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'
import { useDelegatorsTwabDelegations } from '@twabDelegator/hooks/useDelegatorsTwabDelegations'
import { useResetDelegationAtoms } from '@twabDelegator/hooks/useResetDelegationAtoms'
import { ListState } from '@twabDelegator/DelegationList'
import { DelegationId } from '@twabDelegator/interfaces'
import { useTokenAllowance, useTokenBalance } from '@pooltogether/hooks'
import { useV4Ticket } from '@hooks/v4/useV4Ticket'
import { getV4TicketContract } from '@utils/getV4TicketContract'
import { BigNumber, PopulatedTransaction } from 'ethers'
import { TransactionResponse } from '@ethersproject/providers'
import { toast } from 'react-toastify'
import { TransactionReceiptButton } from '@components/Buttons/TransactionReceiptButton'
import { TransactionButton } from '@components/Buttons/TransactionButton'
import { useIsDelegatorsBalanceSufficient } from '@twabDelegator/hooks/useIsDelegatorsBalanceSufficient'
import { getPoolTogetherDepositUrl } from '@utils/getPoolTogetherDepositUrl'
import { DELEGATION_LEARN_MORE_URL } from '@twabDelegator/constants'
import {
  useSendTransaction,
  useSendTransactions,
  useTransaction,
  useTransactions,
  useUsersAddress
} from '@pooltogether/wallet-connection'
import { useTotalAmountDelegated } from '@twabDelegator/hooks/useTotalAmountDelegated'
import { useTranslation } from 'react-i18next'
import { useIsUserDelegatorsRepresentative } from '@twabDelegator/hooks/useIsUserDelegatorsRepresentative'
import { useDelegatorsStake } from '@twabDelegator/hooks/useDelegatorsStake'
import { useIsDelegatorsStakeSufficient } from '@twabDelegator/hooks/useIsDelegatorsStakeSufficient'
import { useSigner } from 'wagmi'
import { EditedIconAndCount } from './ListStateActions'

enum ConfirmModalState {
  review = 'REVIEW',
  receipt = 'RECEIPT'
}

/**
 * TODO: Show users Ticket balance after the update goes through: 526.12 PTaUSDC - (100 PTaUSDC in update)
 * @param props
 * @returns
 */
export const ConfirmUpdatesModal: React.FC<{
  chainId: number
  delegator: string
  transactionIds: string[]
  transactionsPending: boolean
  setSignaturePending: (pending: boolean) => void
  setTransactionIds: (transactionIds: string[]) => void
  onSuccess?: () => void
}> = (props) => {
  const {
    chainId,
    delegator,
    transactionIds,
    transactionsPending,
    setSignaturePending,
    onSuccess,
    setTransactionIds
  } = props
  const [editsCount] = useAtom(delegationUpdatesCountAtom)
  const [creationsCount] = useAtom(delegationCreationsCountAtom)
  const [fundsCount] = useAtom(delegationFundsCountAtom)
  const [modalState, setModalState] = useState(ConfirmModalState.review)
  const [isOpen, setIsOpen] = useAtom(delegationUpdatesModalOpenAtom)
  const transactions = useTransactions(transactionIds)
  const { t } = useTranslation()
  const isBalanceSufficient = useIsDelegatorsBalanceSufficient(chainId, delegator)
  const isStakeSufficient = useIsDelegatorsStakeSufficient(chainId, delegator)
  const usersAddress = useUsersAddress()
  const { data: isUserARepresentative, isFetched: isRepresentativeFetched } =
    useIsUserDelegatorsRepresentative(chainId, usersAddress, delegator)

  let content
  if (modalState === ConfirmModalState.review) {
    content = (
      <div className='flex flex-col space-y-4'>
        <ModalTitle chainId={chainId} title={t('delegationConfirmation')} />
        {isRepresentativeFetched && !isUserARepresentative && (
          <TicketBalanceWarning chainId={chainId} isBalanceSufficient={isBalanceSufficient} />
        )}
        {isRepresentativeFetched && isUserARepresentative && (
          <TicketStakeWarning chainId={chainId} isStakeSufficient={isStakeSufficient} />
        )}
        <DelegationLockWarning />

        <div>
          <div className='mb-1 flex justify-between'>
            <p className='text-xs font-bold capitalize'>{t('reviewChanges')}</p>
            <div className='flex flex-row space-x-2'>
              <EditedIconAndCount
                count={creationsCount}
                icon='plus-circle'
                tooltipText={t('createSlot')}
              />
              <EditedIconAndCount
                count={fundsCount}
                icon='dollar-sign'
                tooltipText={t('fundDelegatee')}
              />
              <EditedIconAndCount
                count={editsCount}
                icon='edit-2'
                tooltipText={t('editDelegatee')}
              />
            </div>
          </div>
          <DelegationConfirmationList chainId={chainId} delegator={delegator} />
        </div>
        <SubmitTransactionButton
          chainId={chainId}
          delegator={delegator}
          transactionsPending={transactionsPending}
          isBalanceSufficient={isBalanceSufficient}
          isStakeSufficient={isStakeSufficient}
          isUserARepresentative={isUserARepresentative}
          isRepresentativeFetched={isRepresentativeFetched}
          setIsOpen={setIsOpen}
          setTransactionIds={setTransactionIds}
          setModalState={setModalState}
          onSuccess={onSuccess}
          setSignaturePending={setSignaturePending}
        />
      </div>
    )
  } else {
    content = (
      <div className='flex flex-col space-y-12'>
        <ModalTitle chainId={chainId} title={t('delegationTransactionSubmitted')} />
        {transactions.map((transaction) => (
          <TransactionReceiptButton chainId={chainId} transaction={transaction} />
        ))}
      </div>
    )
  }

  return (
    <BottomSheet
      label='delegation-edit-modal'
      open={isOpen}
      onDismiss={() => {
        setIsOpen(false)
        if (!transactionsPending) {
          setModalState(ConfirmModalState.review)
        }
      }}
    >
      {content}
    </BottomSheet>
  )
}

/**
 *
 * @returns
 */
const DelegationLockWarning: React.FC = () => {
  const [lockCount] = useAtom(delegationUpdatedLocksCountAtom)
  const { t } = useTranslation()

  if (!lockCount) return null

  return (
    <Banner
      theme={BannerTheme.rainbowBorder}
      innerClassName='flex flex-col items-center text-center space-y-2 text-xs'
    >
      <FeatherIcon icon='alert-triangle' className='text-yellow' />
      <p className='text-xs'>{t('delegationConfirmationDescription')}</p>
      <a
        className='transition text-pt-teal hover:opacity-70 underline flex items-center space-x-1'
        href={DELEGATION_LEARN_MORE_URL}
        target='_blank'
        rel='noreferrer'
      >
        <span>{t('learnMoreAboutDepositDelegation')}</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a>
    </Banner>
  )
}

const TicketBalanceWarning: React.FC<{ isBalanceSufficient: boolean; chainId: number }> = (
  props
) => {
  const { isBalanceSufficient, chainId } = props
  const { t } = useTranslation()

  if (isBalanceSufficient === null || isBalanceSufficient) return null

  return (
    <Banner
      theme={BannerTheme.rainbowBorder}
      innerClassName='flex flex-col items-center text-center space-y-2 text-xs'
    >
      <FeatherIcon icon='alert-triangle' className='text-pt-red-light' />
      <p className='text-xs'>{t('delegatedAmountTooLarge')}</p>
      <a
        className='transition text-pt-teal hover:opacity-70 underline flex items-center space-x-1'
        href={getPoolTogetherDepositUrl(chainId)}
        target='_blank'
        rel='noreferrer'
      >
        <span>{t('depositMore')}</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a>
    </Banner>
  )
}

const TicketStakeWarning: React.FC<{ isStakeSufficient: boolean; chainId: number }> = (props) => {
  const { isStakeSufficient } = props
  const { t } = useTranslation()

  if (isStakeSufficient === null || isStakeSufficient) return null

  return (
    <Banner
      theme={BannerTheme.rainbowBorder}
      innerClassName='flex flex-col items-center text-center space-y-2 text-xs'
    >
      <FeatherIcon icon='alert-triangle' className='text-pt-red-light' />
      <p className='text-xs'>{t('delegatedAmountTooLargeForStake')}</p>
      <a
        className='transition text-pt-teal hover:opacity-70 underline flex items-center space-x-1'
        href={DELEGATION_LEARN_MORE_URL}
        target='_blank'
        rel='noreferrer'
      >
        <span>{t('learnMoreAboutDepositDelegation')}</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a>
    </Banner>
  )
}

interface SubmitTransactionButtonProps {
  chainId: number
  delegator: string
  transactionsPending: boolean
  isBalanceSufficient: boolean
  isStakeSufficient: boolean
  isUserARepresentative: boolean
  isRepresentativeFetched: boolean
  setIsOpen: (isOpen: boolean) => void
  setSignaturePending: (pending: boolean) => void
  setTransactionIds: (id: string) => void
  setModalState: (modalState: ConfirmModalState) => void
  onSuccess?: () => void
}

/**
 * https://docs.ethers.io/v5/api/contract/contract/#contract-populateTransaction
 * @param props
 * @returns
 */
const SubmitTransactionButton: React.FC<SubmitTransactionButtonProps> = (props) => {
  const {
    chainId,
    delegator,
    transactionsPending,
    isBalanceSufficient,
    isStakeSufficient,
    isUserARepresentative,
    isRepresentativeFetched,
    setIsOpen,
    setSignaturePending,
    setModalState,
    onSuccess,
    setTransactionIds
  } = props
  const [delegationCreations] = useAtom(delegationCreationsAtom)
  const [delegationUpdates] = useAtom(delegationUpdatesAtom)
  const [delegationFunds] = useAtom(delegationFundsAtom)
  const [delegationWithdrawals] = useAtom(delegationWithdrawalsAtom)
  const { data: delegations, refetch } = useDelegatorsTwabDelegations(chainId, delegator)
  const resetAtoms = useResetDelegationAtoms()
  const { data: signer } = useSigner()
  const usersAddress = useUsersAddress()
  const ticket = useV4Ticket(chainId)

  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  const { data: allowance, isFetched: isAllowanceFetched } = useTokenAllowance(
    chainId,
    usersAddress,
    twabDelegatorAddress,
    ticket.address
  )
  const { isFetched: isStakeFetched, refetch: refetchStake } = useDelegatorsStake(
    chainId,
    delegator
  )
  const { refetch: refetchTicketBalance } = useTokenBalance(chainId, delegator, ticket.address)
  const { refetch: refetchDelegationBalance } = useTotalAmountDelegated(chainId, delegator)
  const { t } = useTranslation()

  const sendTransaction = useSendTransaction(t)
  const sendTransactions = useSendTransactions(t)

  const getDelegation = (delegationId: DelegationId) =>
    delegations.find(
      (delegation) =>
        delegation.delegationId.slot.eq(delegationId.slot) &&
        delegation.delegationId.delegator === delegationId.delegator
    )

  const submitUpdateTransaction = async () => {
    if (isUserARepresentative) {
      return submitUpdateTransactionForRepresentative()
    }
    submitUpdateTransactionForDelegator()
  }

  const submitUpdateTransactionForDelegator = async () => {
    const twabDelegatorContract = getTwabDelegatorContract(chainId, signer)
    const ticketContract = getV4TicketContract(chainId)
    const fnCalls: string[] = []
    let totalAmountToFund = BigNumber.from(0)

    // Add creations to the list of transactions
    for (const delegationCreation of delegationCreations) {
      const { slot, delegatee, lockDuration } = delegationCreation
      const populatedTx = await twabDelegatorContract.populateTransaction.createDelegation(
        delegator,
        slot,
        delegatee,
        lockDuration
      )
      fnCalls.push(populatedTx.data)
    }

    // Add updates to the list of transactions
    for (const delegationUpdate of delegationUpdates) {
      const { slot, delegatee, lockDuration } = delegationUpdate
      const populatedTx = await twabDelegatorContract.populateTransaction.updateDelegatee(
        delegator,
        slot,
        delegatee,
        lockDuration
      )
      fnCalls.push(populatedTx.data)
    }

    // Add withdrawals to the list of transactions
    for (const delegationWithdrawal of delegationWithdrawals) {
      const { slot, amount } = delegationWithdrawal
      const delegation = getDelegation(delegationWithdrawal)
      const amountToWithdraw = delegation.delegation.balance.sub(amount)
      const populatedTx = await twabDelegatorContract.populateTransaction.transferDelegationTo(
        slot,
        amountToWithdraw,
        delegator
      )
      fnCalls.push(populatedTx.data)
    }

    // Add funds to the list of transactions
    for (const delegationFund of delegationFunds) {
      const { slot, amount } = delegationFund
      const delegation = getDelegation(delegationFund)
      let amountToFund: BigNumber

      // If there's an existing delegation, amountToFund is the difference
      if (!!delegation) {
        amountToFund = amount.sub(delegation.delegation.balance)
      } else {
        amountToFund = amount
      }

      let populatedTx: PopulatedTransaction

      if (amountToFund.isNegative()) {
        const amountToWithdraw = amountToFund.mul(-1)
        populatedTx = await twabDelegatorContract.populateTransaction.transferDelegationTo(
          slot,
          amountToWithdraw,
          delegator
        )
      } else {
        totalAmountToFund = totalAmountToFund.add(amountToFund)
        populatedTx = await twabDelegatorContract.populateTransaction.fundDelegation(
          delegator,
          slot,
          amountToFund
        )
      }
      fnCalls.push(populatedTx.data)
    }

    let callTransaction: () => Promise<TransactionResponse>

    // If allowance is not high enough get a Permit signature for permitAndMulticall
    if (!totalAmountToFund.isZero() && allowance.lt(totalAmountToFund)) {
      setSignaturePending(true)

      const amountToIncrease = totalAmountToFund.sub(allowance)
      const domain = {
        name: 'PoolTogether ControlledToken',
        version: '1',
        chainId,
        verifyingContract: ticketContract.address
      }

      // NOTE: Nonce must be passed manually for signERC2612Permit to work with WalletConnect
      const deadline = (await signer.provider.getBlock('latest')).timestamp + 5 * 60
      const response = await ticketContract.functions.nonces(usersAddress)
      const nonce: BigNumber = response[0]

      const signaturePromise = signERC2612Permit(
        signer,
        domain,
        usersAddress,
        twabDelegatorContract.address,
        amountToIncrease.toString(),
        deadline,
        nonce.toNumber()
      )

      toast.promise(signaturePromise, {
        pending: t('signatureIsPending'),
        error: t('signatureRejected')
      })

      try {
        const signature = await signaturePromise

        // Overwrite v for hardware wallet signatures
        // https://ethereum.stackexchange.com/questions/103307/cannot-verifiy-a-signature-produced-by-ledger-in-solidity-using-ecrecover
        const v = signature.v < 27 ? signature.v + 27 : signature.v

        console.log({
          twabDelegatorContract,
          fnCalls,
          amountToIncrease,
          sig: {
            deadline: signature.deadline,
            v,
            r: signature.r,
            s: signature.s
          }
        })

        callTransaction = async () =>
          twabDelegatorContract.permitAndMulticall(
            amountToIncrease,
            {
              deadline: signature.deadline,
              v,
              r: signature.r,
              s: signature.s
            },
            fnCalls
          )
      } catch (e) {
        setSignaturePending(false)
        console.error(e)
        return
      }
    } else {
      console.log({ twabDelegatorContract, fnCalls })
      callTransaction = async () => twabDelegatorContract.multicall(fnCalls)
    }

    const transactionId = sendTransaction({
      name: t('updateDelegations') + ' (1/2)',
      callTransaction,
      callbacks: {
        onSentToWallet: () => {
          setSignaturePending(false)
        },
        onConfirmedByUser: () => {
          setModalState(ConfirmModalState.receipt)
        },
        onSuccess: async () => {
          await refetch()
          resetAtoms()
          onSuccess?.()
          setIsOpen(false)
          refetchDelegationBalance()
          refetchTicketBalance()
          setModalState(ConfirmModalState.review)
        }
      }
    })
    const transactionId2 = sendTransaction({
      name: t('updateDelegations') + ' (2/2)',
      callTransaction,
      callbacks: {
        onSentToWallet: () => {
          setSignaturePending(false)
        },
        onConfirmedByUser: () => {
          setModalState(ConfirmModalState.receipt)
        },
        onSuccess: async () => {
          await refetch()
          resetAtoms()
          onSuccess?.()
          setIsOpen(false)
          refetchDelegationBalance()
          refetchTicketBalance()
          setModalState(ConfirmModalState.review)
        }
      }
    })
    console.log({ transactionId, transactionId2 })
    setTransactionIds(transactionId)
  }

  const submitUpdateTransactionForRepresentative = async () => {
    const twabDelegatorContract = getTwabDelegatorContract(chainId, signer)
    const fnCalls: string[] = []
    let totalAmountToFund = BigNumber.from(0)

    // Add creations to the list of transactions
    for (const delegationCreation of delegationCreations) {
      const { slot, delegatee, lockDuration } = delegationCreation
      const populatedTx = await twabDelegatorContract.populateTransaction.createDelegation(
        delegator,
        slot,
        delegatee,
        lockDuration
      )
      fnCalls.push(populatedTx.data)
    }

    // Add updates to the list of transactions
    for (const delegationUpdate of delegationUpdates) {
      const { slot, delegatee, lockDuration } = delegationUpdate
      const populatedTx = await twabDelegatorContract.populateTransaction.updateDelegatee(
        delegator,
        slot,
        delegatee,
        lockDuration
      )
      fnCalls.push(populatedTx.data)
    }

    // Add withdrawals to the list of transactions
    for (const delegationWithdrawal of delegationWithdrawals) {
      const { slot, amount } = delegationWithdrawal
      const delegation = getDelegation(delegationWithdrawal)
      const amountToWithdraw = delegation.delegation.balance.sub(amount)
      const populatedTx = await twabDelegatorContract.populateTransaction.withdrawDelegationToStake(
        delegator,
        slot,
        amountToWithdraw
      )
      fnCalls.push(populatedTx.data)
    }

    // Add funds to the list of transactions
    const withdrawToStakeFnCalls = []
    const depositToStakeFnCalls = []
    for (const delegationFund of delegationFunds) {
      const { slot, amount } = delegationFund
      const delegation = getDelegation(delegationFund)
      let amountToFund: BigNumber

      // If there's an existing delegation, amountToFund is the difference
      if (!!delegation) {
        amountToFund = amount.sub(delegation.delegation.balance)
      } else {
        amountToFund = amount
      }

      let populatedTx: PopulatedTransaction
      if (amountToFund.isNegative()) {
        const amountToWithdraw = amountToFund.mul(-1)
        populatedTx = await twabDelegatorContract.populateTransaction.withdrawDelegationToStake(
          delegator,
          slot,
          amountToWithdraw
        )
        withdrawToStakeFnCalls.push(populatedTx.data)
      } else {
        totalAmountToFund = totalAmountToFund.add(amountToFund)
        populatedTx = await twabDelegatorContract.populateTransaction.fundDelegationFromStake(
          delegator,
          slot,
          amountToFund
        )
        depositToStakeFnCalls.push(populatedTx.data)
      }
    }
    fnCalls.push(...withdrawToStakeFnCalls, ...depositToStakeFnCalls)

    const callTransaction = async () => twabDelegatorContract.multicall(fnCalls)

    const transactionId = sendTransaction({
      name: t('updateDelegations'),
      callTransaction,
      callbacks: {
        onSentToWallet: () => {
          setSignaturePending(false)
        },
        onConfirmedByUser: () => {
          setModalState(ConfirmModalState.receipt)
        },
        onSuccess: async () => {
          await refetch()
          resetAtoms()
          onSuccess?.()
          setIsOpen(false)
          refetchDelegationBalance()
          refetchStake()
          setModalState(ConfirmModalState.review)
        }
      }
    })
    setTransactionIds(transactionId)
  }

  return (
    <TransactionButton
      className='w-full'
      onClick={submitUpdateTransaction}
      disabled={
        !signer ||
        !isAllowanceFetched ||
        transactionsPending ||
        (!isUserARepresentative && !isBalanceSufficient) ||
        (isUserARepresentative && !isStakeSufficient) ||
        !isRepresentativeFetched ||
        (isUserARepresentative && !isStakeFetched)
      }
      pending={transactionsPending}
      chainId={chainId}
    >
      {t('confirmUpdates')}
    </TransactionButton>
  )
}
