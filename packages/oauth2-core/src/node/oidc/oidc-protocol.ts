export namespace OidcScopes {

    /**
     * The `openid`scope is required for OpenID Connect Authentication Requests.
     */
    export const OPENID = 'openid';

    /**
     * The `profile`scope requests access to the default profile claims, which are:
     * `name, family_name, given_name, middle_name, nickname, preferred_username,
     * profile, picture, website, gender, birthdate, zoneinfo, locale, updated_at}.
     */
    export const PROFILE = 'profile';

    /**
     * The `email`scope requests access to the `email`and `email_verified`claims.
     */
    export const EMAIL = 'email';

    /**
     * The `address`scope requests access to the `address`claim.
     */
    export const ADDRESS = 'address';

    /**
     * The `phone`scope requests access to the `phone_number`and `phone_number_verified`claims.
     */
    export const PHONE = 'phone';

}

export namespace OidcParameterNames {

    /**
     * `id_token`- used in the Access Token Response.
     */
    export const ID_TOKEN = 'id_token';

    /**
     * `nonce`- used in the Authentication Request.
     */
    export const NONCE = 'nonce';

}

export namespace StandardClaimNames {

    /**
     * `sub`- the Subject identifier
     */
    export const SUB = 'sub';

    /**
     * `name`- the user's full name
     */
    export const NAME = 'name';

    /**
     * `given_name`- the user's given name(s) or first name(s)
     */
    export const GIVEN_NAME = 'given_name';

    /**
     * `family_name`- the user's surname(s) or last name(s)
     */
    export const FAMILY_NAME = 'family_name';

    /**
     * `middle_name`- the user's middle name(s)
     */
    export const MIDDLE_NAME = 'middle_name';

    /**
     * `nickname`- the user's nick name that may or may not be the same as the `given_name}
     */
    export const NICKNAME = 'nickname';

    /**
     * `preferred_username`- the preferred username that the user wishes to be referred to
     */
    export const PREFERRED_USERNAME = 'preferred_username';

    /**
     * `profile`- the URL of the user's profile page
     */
    export const PROFILE = 'profile';

    /**
     * `picture`- the URL of the user's profile picture
     */
    export const PICTURE = 'picture';

    /**
     * `website`- the URL of the user's web page or blog
     */
    export const WEBSITE = 'website';

    /**
     * `email`- the user's preferred e-mail address
     */
    export const EMAIL = 'email';

    /**
     * `email_verified`- `true`if the user's e-mail address has been verified, otherwise `false}
     */
    export const EMAIL_VERIFIED = 'email_verified';

    /**
     * `gender`- the user's gender
     */
    export const GENDER = 'gender';

    /**
     * `birthdate`- the user's birth date
     */
    export const BIRTHDATE = 'birthdate';

    /**
     * `zoneinfo`- the user's time zone
     */
    export const ZONEINFO = 'zoneinfo';

    /**
     * `locale`- the user's locale
     */
    export const LOCALE = 'locale';

    /**
     * `phone_number`- the user's preferred phone number
     */
    export const PHONE_NUMBER = 'phone_number';

    /**
     * `phone_number_verified`- `true`if the user's phone number has been verified, otherwise `false}
     */
    export const PHONE_NUMBER_VERIFIED = 'phone_number_verified';

    /**
     * `address`- the user's preferred postal address
     */
    export const ADDRESS = 'address';

    /**
     * `updated_at`- the time the user's information was last updated
     */
    export const UPDATED_AT = 'updated_at';

}
