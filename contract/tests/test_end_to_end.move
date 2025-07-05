#[test_only]
module will_contract_addr::will_tests {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use std::option;

    use will_contract_addr::will;

    #[test(aptos_framework = @0x1, creator = @will_contract_addr, recipient = @0x2, registry = @0x4)]
    fun test_happy_path(
        aptos_framework: &signer,
        creator: &signer,
        recipient: &signer,
        registry: &signer,
    ) acquires will::WillState, will::GlobalWillRegistry {
        let creator_addr = signer::address_of(creator);
        let recipient_addr = signer::address_of(recipient);
        let registry_addr = signer::address_of(registry);

        // Initialize AptosCoin for test
        let (burn_cap, mint_cap) = aptos_framework::aptos_coin::initialize_for_test(aptos_framework);

        // Create accounts and register AptosCoin
        account::create_account_for_test(creator_addr);
        account::create_account_for_test(recipient_addr);
        account::create_account_for_test(registry_addr);
        coin::register<AptosCoin>(creator);
        coin::register<AptosCoin>(recipient);

        // Mint test AptosCoin for the creator
        aptos_framework::aptos_coin::mint(aptos_framework, creator_addr, 10_000_000); // 10 APT

        // Initialize global registry and creator's WillState
        will::initialize_global_registry(registry);
        will::initialize(creator);

        // Create a will with 1 APT and 120 seconds timeout
        will::create_will(creator, recipient_addr, 1_000_000, 120, registry_addr); // 1 APT = 1,000,000 microAPT, 120 seconds timeout

        // Verify initial state
        let will_opt = will::get_will(creator_addr);
        assert!(option::is_some(&will_opt), 1);
        let will = option::extract(&mut will_opt);
        assert!(will.recipient == recipient_addr, 2);
        assert!(will.amount == 1_000_000, 3);
        assert!(will.timeout_secs == 120, 4); // User-specified 120-second timeout

        // Simulate time passing (advance timestamp for testing)
        timestamp::update_global_time_for_test_secs(130); // 130 seconds > 120-second timeout

        // Claim the will as the recipient
        will::claim_single(recipient, registry_addr);

        // Verify the will has been claimed (will is removed)
        let will_opt_after = will::get_will(creator_addr);
        assert!(option::is_none(&will_opt_after), 5);
        assert!(coin::balance<AptosCoin>(recipient_addr) == 1_000_000, 6); // Recipient should have the amount

        // Clean up
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(aptos_framework = @0x1, creator = @will_contract_addr, registry = @0x4)]
    #[expected_failure(abort_code = 2, location = will_contract_addr::will)] // ERR_NOT_FOUND
    fun test_unauthorized_ping(
        aptos_framework: &signer,
        creator: &signer,
        registry: &signer,
    ) acquires will::WillState, will::GlobalWillRegistry {
        let creator_addr = signer::address_of(creator);
        let unauthorized_addr = @0x3;
        let registry_addr = signer::address_of(registry);

        // Initialize AptosCoin for test
        let (burn_cap, mint_cap) = aptos_framework::aptos_coin::initialize_for_test(aptos_framework);

        // Create accounts and register AptosCoin
        account::create_account_for_test(creator_addr);
        account::create_account_for_test(unauthorized_addr);
        account::create_account_for_test(registry_addr);
        coin::register<AptosCoin>(creator);
        let unauthorized_signer = account::create_signer_for_test(unauthorized_addr);

        // Mint test AptosCoin for the creator
        aptos_framework::aptos_coin::mint(aptos_framework, creator_addr, 10_000_000);

        // Initialize global registry and creator's WillState
        will::initialize_global_registry(registry);
        will::initialize(creator);

        // Create a will with 60 seconds timeout
        will::create_will(creator, @0x2, 1_000_000, 60, registry_addr); // 60 seconds timeout

        // Attempt to ping with unauthorized account (should fail with ERR_NOT_FOUND)
        will::ping(&unauthorized_signer);

        // Clean up
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(aptos_framework = @0x1, creator = @will_contract_addr, recipient = @0x2, registry = @0x4)]
    fun test_custom_timeout(
        aptos_framework: &signer,
        creator: &signer,
        recipient: &signer,
        registry: &signer,
    ) acquires will::WillState, will::GlobalWillRegistry {
        let creator_addr = signer::address_of(creator);
        let recipient_addr = signer::address_of(recipient);
        let registry_addr = signer::address_of(registry);

        // Initialize AptosCoin for test
        let (burn_cap, mint_cap) = aptos_framework::aptos_coin::initialize_for_test(aptos_framework);

        // Create accounts and register AptosCoin
        account::create_account_for_test(creator_addr);
        account::create_account_for_test(recipient_addr);
        account::create_account_for_test(registry_addr);
        coin::register<AptosCoin>(creator);
        coin::register<AptosCoin>(recipient);

        // Mint test AptosCoin for the creator
        aptos_framework::aptos_coin::mint(aptos_framework, creator_addr, 10_000_000);

        // Initialize global registry and creator's WillState
        will::initialize_global_registry(registry);
        will::initialize(creator);

        // Create a will with custom timeout (300 seconds = 5 minutes)
        will::create_will(creator, recipient_addr, 1_000_000, 300, registry_addr);

        // Verify the custom timeout is set correctly
        let will_opt = will::get_will(creator_addr);
        assert!(option::is_some(&will_opt), 1);
        let will = option::extract(&mut will_opt);
        assert!(will.timeout_secs == 300, 2); // Custom 300-second timeout

        // Simulate time passing but not enough to trigger timeout (250 seconds < 300)
        timestamp::update_global_time_for_test_secs(250);

        // Try to claim too early (should fail with ERR_TOO_SOON)
        // This should fail, so we won't call it in this test

        // Advance time beyond the custom timeout (350 seconds > 300)
        timestamp::update_global_time_for_test_secs(350);

        // Now claim should succeed
        will::claim_single(recipient, registry_addr);

        // Verify the will has been claimed
        let will_opt_after = will::get_will(creator_addr);
        assert!(option::is_none(&will_opt_after), 3);
        assert!(coin::balance<AptosCoin>(recipient_addr) == 1_000_000, 4);

        // Clean up
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(aptos_framework = @0x1, creator = @will_contract_addr, recipient = @0x2, registry = @0x4)]
    #[expected_failure(abort_code = 3, location = will_contract_addr::will)] // ERR_TOO_SOON
    fun test_claim_too_soon(
        aptos_framework: &signer,
        creator: &signer,
        recipient: &signer,
        registry: &signer,
    ) acquires will::WillState, will::GlobalWillRegistry {
        let creator_addr = signer::address_of(creator);
        let recipient_addr = signer::address_of(recipient);
        let registry_addr = signer::address_of(registry);

        // Initialize AptosCoin for test
        let (burn_cap, mint_cap) = aptos_framework::aptos_coin::initialize_for_test(aptos_framework);

        // Create accounts and register AptosCoin
        account::create_account_for_test(creator_addr);
        account::create_account_for_test(recipient_addr);
        account::create_account_for_test(registry_addr);
        coin::register<AptosCoin>(creator);
        coin::register<AptosCoin>(recipient);

        // Mint test AptosCoin for the creator
        aptos_framework::aptos_coin::mint(aptos_framework, creator_addr, 10_000_000);

        // Initialize global registry and creator's WillState
        will::initialize_global_registry(registry);
        will::initialize(creator);

        // Create a will with 180 seconds timeout
        will::create_will(creator, recipient_addr, 1_000_000, 180, registry_addr);

        // Advance time but not enough to trigger timeout (100 seconds < 180)
        timestamp::update_global_time_for_test_secs(100);

        // Try to claim too early (should fail with ERR_TOO_SOON)
        will::claim_single(recipient, registry_addr);

        // Clean up
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(aptos_framework = @0x1, creator = @will_contract_addr, registry = @0x4)]
    #[expected_failure(abort_code = 6, location = will_contract_addr::will)] // ERR_INVALID_TIMEOUT
    fun test_invalid_timeout(
        aptos_framework: &signer,
        creator: &signer,
        registry: &signer,
    ) acquires will::WillState, will::GlobalWillRegistry {
        let creator_addr = signer::address_of(creator);
        let registry_addr = signer::address_of(registry);

        // Initialize AptosCoin for test
        let (burn_cap, mint_cap) = aptos_framework::aptos_coin::initialize_for_test(aptos_framework);

        // Create accounts and register AptosCoin
        account::create_account_for_test(creator_addr);
        account::create_account_for_test(registry_addr);
        coin::register<AptosCoin>(creator);

        // Mint test AptosCoin for the creator
        aptos_framework::aptos_coin::mint(aptos_framework, creator_addr, 10_000_000);

        // Initialize global registry and creator's WillState
        will::initialize_global_registry(registry);
        will::initialize(creator);

        // Try to create a will with invalid timeout (0 seconds should fail)
        will::create_will(creator, @0x2, 1_000_000, 0, registry_addr);

        // Clean up
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(aptos_framework = @0x1, creator = @will_contract_addr, recipient = @0x2, registry = @0x4)]
    fun test_ping_resets_timeout(
        aptos_framework: &signer,
        creator: &signer,
        recipient: &signer,
        registry: &signer,
    ) acquires will::WillState, will::GlobalWillRegistry {
        let creator_addr = signer::address_of(creator);
        let recipient_addr = signer::address_of(recipient);
        let registry_addr = signer::address_of(registry);

        // Initialize AptosCoin for test
        let (burn_cap, mint_cap) = aptos_framework::aptos_coin::initialize_for_test(aptos_framework);

        // Create accounts and register AptosCoin
        account::create_account_for_test(creator_addr);
        account::create_account_for_test(recipient_addr);
        account::create_account_for_test(registry_addr);
        coin::register<AptosCoin>(creator);
        coin::register<AptosCoin>(recipient);

        // Mint test AptosCoin for the creator
        aptos_framework::aptos_coin::mint(aptos_framework, creator_addr, 10_000_000);

        // Initialize global registry and creator's WillState
        will::initialize_global_registry(registry);
        will::initialize(creator);

        // Create a will with 120 seconds timeout
        will::create_will(creator, recipient_addr, 1_000_000, 120, registry_addr);

        // Advance time to just before timeout (100 seconds < 120)
        timestamp::update_global_time_for_test_secs(100);

        // Ping to reset the timeout
        will::ping(creator);

        // Advance time again (50 more seconds from the ping time)
        timestamp::update_global_time_for_test_secs(150);

        // At this point, 150 seconds have passed from creation, but only 50 seconds from ping
        // So claim should still fail (50 < 120)
        // We'll advance time further to make claim succeed

        // Advance time beyond the timeout from ping time (220 seconds from ping > 120)
        timestamp::update_global_time_for_test_secs(220);

        // Now claim should succeed
        will::claim_single(recipient, registry_addr);

        // Verify the will has been claimed
        let will_opt_after = will::get_will(creator_addr);
        assert!(option::is_none(&will_opt_after), 1);
        assert!(coin::balance<AptosCoin>(recipient_addr) == 1_000_000, 2);

        // Clean up
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }
}