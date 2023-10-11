
module.exports = {

    'CUSTOMER': {
        signUp_success: 'customer signUp successfully.',
        login_success: 'customer Login successfully.',
        logout_success: 'customer Logout successfully.',
        role_changed: 'role changed successfully',
        new_token_generated:'successfully created new token',
        get_all_customers_searched:'successfully search all customer',
        customer_data_updated:'successfully updated customer data',
        customer_data_deleted:'successfully deleted customer data',
        create_new_excel_file :'successfully created new excel file',
        create_new_excel_file :'successfully created new excel file',
        customer_not_found : 'customer data not found',
        check_customer_or_driver: 'your are not customers',
        check_mobile_number : 'mobile number already exist',
        account_verify : 'customer account not verified',
        customer_in_active : 'customer account in active',
        verify_account:'customer acccount verify sucessfully',
        customer_account_locked: 'Account locked due to too many failed signup attempts',
        customer_same_mobile_number:'customer mobile number is same you can not updated',
        customer_account_lock : 'Account is locked. Please try again later.',
        unauthenticated_failed : 'Authentication failed',
        add_contact : 'successfully created contact',
        update_contact : 'successfully updated contact',
        get_contact:'successfully get customer contact',
        customer_id_not_found : 'customer id not found',
        valid_mobile_number : 'Invalid phone number',
        update_mobile_number : 'successfully updated customer mobile number',
        admin_signup:'admin signup successfully',
        admin_login:'admin login successfully',
        admin_logout:'admin logout successfully',
        get_all_customers:'successfully get all the customers',
        created_excel_file:'successfully created an excel file',
        userData_csv_file:'successfully created an csv file',
        userData_pdf_file:'successfully created an pdf file'
    },
    
    'GENERAL': {
        
        general_error_content: 'Something went wrong. Please try again later.',
        unauthorized_user: 'Unauthorized, please login.',
        invalid_user: 'You are not authorized to do this operation.',
        invalid_token: 'Not valid token.',
        blackList_mail: `Please enter a valid email, we don't allow dummy emails.`
    },

    'BOOKING': {

        booking_created : 'booking successfully created',
        List_of_booking : 'successfully get List of Booking ',
        update_status: 'Booking canceled by user',
        otp_verify:'successfully verifyed otp',
        get_booking_by_customer : 'successfully return all the booking by customers',
        get_booking_by_driver : 'successfully return all the booking by drivers',
        get_all_bookings:'successfully get all bookings',
        get_bookings:'successfully get bookings',
        booking_cancel_by_customer:'booking cancel by customer',
        booking_cancel_by_driver:'booking cancel by driver',
        driver_booking_confirm : 'successfully driver booking confirmed',
        customer_to_driver_distance:'successfully calculate driver to customer distance',
        booking_data_not_found:'booking data not found',
        not_match_customerId : 'customer id not match',
        ride_completed : 'customer booking successfully completed',
        otp_not_match : 'otp not matched',
        company_share:'successfully get return all the company share amount',
        total_earning_by_driver:'successfully get all the drivers earning money'

    },

    'DRIVER': {

        driver_signup : 'driver signup sucessfully',
        driver_login : 'driver login sucessfully',
        driver_logout : 'driver logout sucessfully',
        List_of_booking : 'successfully get List of Booking ',
        booking_cancel: 'Booking canceled',
        booking_confirm: 'Booking confirm',
        List_of_driver : 'successfully get all the drivers',
        driver_not_found : 'driver data nt found',
        check_driver_and_customer : 'your are not driver',
        mobile_number_check :'mobile number already exist',
        driver_current_location_update :'driver current location updated sucessfully',
        not_found : 'No drivers found with the specified device token',
        driver_same_mobile_number:'driver mobile number is same you can not updated',
        add_review:'review submitted successfully',
        get_review : 'sucessfully get reviews',
        Day_earning:'sucessfully get the earning of 24hr',
        Monthly_earning:'sucessfully get the earning of one month',
        year_earning:'sucessfully get the earning ofyear'
    },

    'WALLET':{
        get_wallet : 'successfully get earning money',

    },
    'ADMIN': {
        admin_created: 'Admin created successfully.',
        admin_updated: 'Admin updated successfully.',
        admin_deleted: 'Admin deleted successfully.',
        invalid_role: 'Invalid role specified.',
        username_taken: 'Username is already taken. Please choose a different username.',
        email_taken: 'Email is already in use. Please use a different email address.',
        admin_not_found: 'Admin not found.',
        admin_already_exists: 'Admin with the same username or email already exists.',
        password_reset_success: 'Admin password reset successfully.',
        password_reset_fail: 'Failed to reset admin password.',
        invalid_credentials: 'Invalid admin credentials. Please check your username and password.',
        role_updated: 'Admin role updated successfully.',
        role_update_fail: 'Failed to update admin role.',
        admin_activated: 'Admin account activated successfully.',
        admin_deactivated: 'Admin account deactivated successfully.',
        admin_activation_fail: 'Failed to activate admin account.',
        admin_deactivation_fail: 'Failed to deactivate admin account.',
      },
      


}