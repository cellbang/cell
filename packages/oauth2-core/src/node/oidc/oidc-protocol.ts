export namespace OidcScopes {

    /**
     * The {@code openid} scope is required for OpenID Connect Authentication Requests.
     */
    export const OPENID = 'openid';

    /**
     * The {@code profile} scope requests access to the default profile claims, which are:
     * {@code name, family_name, given_name, middle_name, nickname, preferred_username,
     * profile, picture, website, gender, birthdate, zoneinfo, locale, updated_at}.
     */
    export const PROFILE = 'profile';

    /**
     * The {@code email} scope requests access to the {@code email} and {@code email_verified} claims.
     */
    export const EMAIL = 'email';

    /**
     * The {@code address} scope requests access to the {@code address} claim.
     */
    export const ADDRESS = 'address';

    /**
     * The {@code phone} scope requests access to the {@code phone_number} and {@code phone_number_verified} claims.
     */
    export const PHONE = 'phone';

}

export namespace OidcParameterNames {

    /**
     * {@code id_token} - used in the Access Token Response.
     */
    export const ID_TOKEN = 'id_token';

    /**
     * {@code nonce} - used in the Authentication Request.
     */
    export const NONCE = 'nonce';

}

export namespace StandardClaimNames {

    /**
     * {@code sub} - the Subject identifier
     */
    export const SUB = 'sub';

    /**
     * {@code name} - the user's full name
     */
    export const NAME = 'name';

    /**
     * {@code given_name} - the user's given name(s) or first name(s)
     */
    export const GIVEN_NAME = 'given_name';

    /**
     * {@code family_name} - the user's surname(s) or last name(s)
     */
    export const FAMILY_NAME = 'family_name';

    /**
     * {@code middle_name} - the user's middle name(s)
     */
    export const MIDDLE_NAME = 'middle_name';

    /**
     * {@code nickname} - the user's nick name that may or may not be the same as the {@code given_name}
     */
    export const NICKNAME = 'nickname';

    /**
     * {@code preferred_username} - the preferred username that the user wishes to be referred to
     */
    export const PREFERRED_USERNAME = 'preferred_username';

    /**
     * {@code profile} - the URL of the user's profile page
     */
    export const PROFILE = 'profile';

    /**
     * {@code picture} - the URL of the user's profile picture
     */
    export const PICTURE = 'picture';

    /**
     * {@code website} - the URL of the user's web page or blog
     */
    export const WEBSITE = 'website';

    /**
     * {@code email} - the user's preferred e-mail address
     */
    export const EMAIL = 'email';

    /**
     * {@code email_verified} - {@code true} if the user's e-mail address has been verified, otherwise {@code false}
     */
    export const EMAIL_VERIFIED = 'email_verified';

    /**
     * {@code gender} - the user's gender
     */
    export const GENDER = 'gender';

    /**
     * {@code birthdate} - the user's birth date
     */
    export const BIRTHDATE = 'birthdate';

    /**
     * {@code zoneinfo} - the user's time zone
     */
    export const ZONEINFO = 'zoneinfo';

    /**
     * {@code locale} - the user's locale
     */
    export const LOCALE = 'locale';

    /**
     * {@code phone_number} - the user's preferred phone number
     */
    export const PHONE_NUMBER = 'phone_number';

    /**
     * {@code phone_number_verified} - {@code true} if the user's phone number has been verified, otherwise {@code false}
     */
    export const PHONE_NUMBER_VERIFIED = 'phone_number_verified';

    /**
     * {@code address} - the user's preferred postal address
     */
    export const ADDRESS = 'address';

    /**
     * {@code updated_at} - the time the user's information was last updated
     */
    export const UPDATED_AT = 'updated_at';

}
