#[starknet::contract]
mod contract {
    use hdp_cairo::{HDP, memorizer::storage_memorizer::{StorageKey, StorageMemorizerImpl}};
    use starknet::syscalls::call_contract_syscall;
    use starknet::{ContractAddress, SyscallResult, SyscallResultTrait};

    #[storage]
    struct Storage {}

    #[external(v0)]
    pub fn main(
        ref self: ContractState,
        hdp: HDP,
        mut block_number_list: Array<u32>,
        address: felt252,
        storage_slot: u256
    ) -> u256 {
        let mut result: u256 = 0;
        let mut is_changed: bool = false;
        loop {
            match block_number_list.pop_front() {
                Option::Some(block_number) => {
                    result = hdp
                        .account_memorizer
                        .get_slot(
                            StorageKey {
                                chain_id: 11155111,
                                block_number: block_number.into(),
                                address: address,
                                storage_slot: storage_slot
                            }
                        )
                    if (result != address) {
                        is_changed = true;
                    }
                },
                Option::None => { break; },
            }
        };
        is_changed
    }
}
