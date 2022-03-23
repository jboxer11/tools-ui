import { useUsersAddress } from '@pooltogether/wallet-connection'
import {
  BottomSheet,
  ModalTitle,
  SquareButton,
  SquareButtonSize,
  SquareButtonTheme,
  ThemedClipSpinner,
  Tooltip
} from '@pooltogether/react-components'
import FeatherIcon from 'feather-icons-react'
import {
  delegationUpdatesCountAtom,
  delegationFundsAtom,
  delegationFundsCountAtom,
  delegationUpdatesAtom,
  delegationUpdatesModalOpenAtom,
  delegationWithdrawalsAtom,
  delegationWithdrawlsCountAtom,
  delegationCreationsCountAtom,
  delegationCreationsAtom
} from '@twabDelegator/atoms'
import { useIsDelegatorsBalanceSufficient } from '@twabDelegator/hooks/useIsDelegatorsBalanceSufficient'
import { useAtom } from 'jotai'
import { useResetAtom, useUpdateAtom } from 'jotai/utils'
import { ListState } from '.'
import { ChangeDelegatorModal } from '@twabDelegator/UsersDelegationState'
import { useState } from 'react'
import { NumericKeys } from 'react-hook-form/dist/types/path/common'
import { DelegationConfirmationList } from './DelegationConfirmationList'

interface ListStateActionsProps {
  chainId: number
  listState: ListState
  delegator: string
  transactionPending: boolean
  setListState: (listState: ListState) => void
  setDelegator: (delegator: string) => void
}

// TODO: Cancel confirmation modal
export const ListStateActions: React.FC<ListStateActionsProps> = (props) => {
  const { chainId, listState, transactionPending, delegator, setDelegator, setListState } = props
  const [editsCount] = useAtom(delegationUpdatesCountAtom)
  const [creationsCount] = useAtom(delegationCreationsCountAtom)
  const [fundsCount] = useAtom(delegationFundsCountAtom)
  const [withdrawlsCount] = useAtom(delegationWithdrawlsCountAtom)
  const setIsConfirmationModalOpen = useUpdateAtom(delegationUpdatesModalOpenAtom)
  const resetDelegationUpdates = useResetAtom(delegationUpdatesAtom)
  const resetDelegationCreations = useResetAtom(delegationCreationsAtom)
  const resetDelegationFunds = useResetAtom(delegationFundsAtom)
  const resetDelegationWithdrawals = useResetAtom(delegationWithdrawalsAtom)
  const usersAddress = useUsersAddress()
  const isBalanceSufficient = useIsDelegatorsBalanceSufficient(chainId, delegator)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  // TODO: Return a wrapper with content so we can pass classNames and style the container easier
  if (delegator && usersAddress !== delegator) {
    return (
      <div className='flex justify-end'>
        <SquareButton
          className='px-8'
          size={SquareButtonSize.sm}
          disabled={transactionPending}
          onClick={() => {
            setIsOpen(true)
          }}
          theme={SquareButtonTheme.tealOutline}
        >
          Change Delegator
        </SquareButton>
        <ChangeDelegatorModal
          isOpen={isOpen}
          delegator={delegator}
          setDelegator={setDelegator}
          setIsOpen={setIsOpen}
        />
      </div>
    )
  } else if (listState === ListState.edit) {
    const jsx = (
      <>
        <ConfirmCancellationButton
          chainId={chainId}
          delegator={delegator}
          disabled={transactionPending}
          cancelUpdates={() => {
            resetDelegationUpdates()
            resetDelegationCreations()
            resetDelegationFunds()
            setListState(ListState.readOnly)
          }}
          updatesCount={creationsCount + fundsCount + editsCount}
        />
        <div className='flex space-x-2 items-center'>
          <EditedIconAndCount count={creationsCount} icon='plus-circle' tooltipText='Create slot' />
          <EditedIconAndCount count={fundsCount} icon='dollar-sign' tooltipText='Fund delegatee' />
          <EditedIconAndCount count={editsCount} icon='edit-2' tooltipText='Edit delegatee' />
          {isBalanceSufficient !== null && !isBalanceSufficient && (
            <Tooltip
              id={`tooltip-edited-icon-${Math.random()}`}
              tip={'Your balance is not sufficient to fund these delegations'}
            >
              <FeatherIcon icon='alert-triangle' className='w-4 h-4 text-pt-red-light' />
            </Tooltip>
          )}
          <SquareButton
            className='flex space-x-2'
            size={SquareButtonSize.sm}
            onClick={() => setIsConfirmationModalOpen(true)}
            disabled={!fundsCount && !editsCount && !creationsCount}
          >
            <span>{transactionPending ? 'Saving changes' : 'Save Changes'}</span>
            {transactionPending && <ThemedClipSpinner sizeClassName='w-4 h-4' />}
          </SquareButton>
        </div>
      </>
    )

    return (
      <>
        <div className='hidden xs:flex items-center justify-between space-x-2'>{jsx}</div>
        <div className='flex xs:hidden items-center fixed b-0 l-0 r-0 h-20 bg-pt-purple-light justify-between space-x-2'>
          {jsx}
        </div>
      </>
    )
  } else if (listState === ListState.withdraw) {
    return (
      <div className='flex justify-between space-x-2'>
        <ConfirmCancellationButton
          chainId={chainId}
          delegator={delegator}
          disabled={transactionPending}
          cancelUpdates={() => {
            resetDelegationWithdrawals()
            setListState(ListState.readOnly)
          }}
          updatesCount={withdrawlsCount}
        />
        <SquareButton
          className='flex space-x-2 w-40'
          size={SquareButtonSize.sm}
          onClick={() => setIsConfirmationModalOpen(true)}
          disabled={!withdrawlsCount}
        >
          <span>
            {transactionPending
              ? 'Withdrawing'
              : withdrawlsCount
              ? `Withdraw (${withdrawlsCount})`
              : 'Withdraw'}
          </span>
          {transactionPending && <ThemedClipSpinner sizeClassName='w-3 h-3' />}
        </SquareButton>
      </div>
    )
  }

  return (
    <div className='flex justify-end space-x-2'>
      <SquareButton
        className='w-32'
        size={SquareButtonSize.sm}
        onClick={() => setListState(ListState.withdraw)}
        disabled={transactionPending}
      >
        Withdraw
      </SquareButton>
      <SquareButton
        className='w-24'
        size={SquareButtonSize.sm}
        onClick={() => setListState(ListState.edit)}
        disabled={transactionPending}
      >
        Edit
      </SquareButton>
    </div>
  )
}

const EditedIconAndCount: React.FC<{ count: number; icon: string; tooltipText: string }> = ({
  count,
  icon,
  tooltipText
}) => {
  if (count < 1) return null
  return (
    <div className='flex space-x-1'>
      <Tooltip id={`tooltip-edited-icon-${Math.random()}`} tip={tooltipText}>
        <div className='col-span-2 flex space-x-1 items-center'>
          <span className='text-xxxs'>{count}</span>
          <FeatherIcon icon={icon} className='w-4 h-4 text-yellow' />
        </div>
      </Tooltip>
    </div>
  )
}

interface ConfirmCancellationProps {
  chainId: number
  delegator: string
  updatesCount: number
  disabled: boolean
  cancelUpdates: () => void
}

const ConfirmCancellationButton: React.FC<ConfirmCancellationProps> = (props) => {
  const { disabled, updatesCount, cancelUpdates } = props

  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <>
      <div>
        <SquareButton
          className='w-24'
          size={SquareButtonSize.sm}
          onClick={() => {
            if (!updatesCount) {
              cancelUpdates()
            } else {
              setIsOpen(true)
            }
          }}
          theme={SquareButtonTheme.tealOutline}
          disabled={disabled}
        >
          Cancel
        </SquareButton>
      </div>
      <ConfirmCancellationModal {...props} isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  )
}

const ConfirmCancellationModal: React.FC<{
  chainId: number
  delegator: string
  disabled: boolean
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  cancelUpdates: () => void
}> = (props) => {
  const { chainId, delegator, isOpen, disabled, setIsOpen, cancelUpdates } = props
  return (
    <BottomSheet
      label='cancel-delegation-edits-modal'
      open={isOpen}
      onDismiss={() => {
        setIsOpen(false)
      }}
      className='flex flex-col space-y-4'
    >
      <ModalTitle chainId={chainId} title={'Confirm cancellation'} />
      <div>
        <p className='text-xs font-bold mb-1'>Lost changes</p>
        <DelegationConfirmationList chainId={chainId} delegator={delegator} />
      </div>
      <SquareButton
        className='w-full'
        onClick={cancelUpdates}
        theme={SquareButtonTheme.orangeOutline}
        disabled={disabled}
      >
        Cancel changes
      </SquareButton>
    </BottomSheet>
  )
}
