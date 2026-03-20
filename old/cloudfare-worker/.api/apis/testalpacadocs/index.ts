import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'testalpacadocs/1.1.1 (api/6.1.3)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * Retrieves the first 1000 accounts that match the query parameters.
   * Sorting is based on creation time.
   * The created_after/created_before query parameters can be used to paginate the results.
   * To further limit the size of the response, the entities query parameter can be used to
   * specify which properties are included in the response.
   *
   * @summary Get All Accounts
   */
  getAllAccounts(metadata?: types.GetAllAccountsMetadataParam): Promise<FetchResponse<200, types.GetAllAccountsResponse200>> {
    return this.core.fetch('/v1/accounts', 'get', metadata);
  }

  /**
   * Submit an account application with KYC information. This will create a trading account
   * for the end user. The account status may or may not be ACTIVE immediately and you will
   * receive account status updates on the event API.
   *
   * @summary Create an Account
   * @throws FetchError<400, types.CreateAccountResponse400> The post body is not well formed.
   * @throws FetchError<422, types.CreateAccountResponse422> One of the input values is not a valid value.
   */
  createAccount(body: types.CreateAccountBodyParam): Promise<FetchResponse<200, types.CreateAccountResponse200>> {
    return this.core.fetch('/v1/accounts', 'post', body);
  }

  /**
   * You can query a specific account that you submitted to Alpaca by passing into the query
   * the account_id associated with the account you’re retrieving.
   *
   * @summary Get An Account by ID
   */
  getAccount(metadata: types.GetAccountMetadataParam): Promise<FetchResponse<200, types.GetAccountResponse200>> {
    return this.core.fetch('/v1/accounts/{account_id}', 'get', metadata);
  }

  /**
   * This operation updates account information.
   *
   * If all parameters are valid and updates have been made, it returns with status code 200.
   * The response is the account model.
   *
   * @summary Update an Account
   * @throws FetchError<400, types.PatchAccountResponse400> The post body is not well formed.
   * @throws FetchError<422, types.PatchAccountResponse422> ​ The request body contains an attribute that is not permitted to be updated or you are
   * attempting to set an invalid value.
   */
  patchAccount(body: types.PatchAccountBodyParam, metadata: types.PatchAccountMetadataParam): Promise<FetchResponse<200, types.PatchAccountResponse200>> {
    return this.core.fetch('/v1/accounts/{account_id}', 'patch', body, metadata);
  }

  /**
   * This endpoint requests options trading for an account.
   * Following submission, an assigned administrator will review the request.
   * Upon approval, the account's options_approved_level parameter will be modified, granting
   * the account the ability to participate in options trading.
   * Note: This endpoint is only available for partners who have been enabled for Options
   * BETA.
   *
   * @summary Request options trading for an account (BETA)
   * @throws FetchError<400, types.RequestOptionsForAccountResponse400> The request body is invalid.
   * @throws FetchError<401, types.RequestOptionsForAccountResponse401> Client does not exist, you do not have access to the client, or “client_secret” is
   * incorrect.
   *
   * @throws FetchError<422, types.RequestOptionsForAccountResponse422> The request body did not pass all validations.
   */
  requestOptionsForAccount(body: types.RequestOptionsForAccountBodyParam, metadata: types.RequestOptionsForAccountMetadataParam): Promise<FetchResponse<200, types.RequestOptionsForAccountResponse200>> {
    return this.core.fetch('/v1/accounts/{account_id}/options/approval', 'post', body, metadata);
  }

  /**
   * This endpoint retrieves options trading level approval requests. Query parameters can be
   * specified to filter the results. If multiple query parameters are specified, the results
   * will be filtered to include only those that match all of the specified parameters. Each
   * query parameter can only be specified once.
   *
   * @summary Retrieve options level approval requests (BETA)
   * @throws FetchError<400, types.RequestListOptionsApprovalsResponse400> The request body is invalid.
   * @throws FetchError<401, types.RequestListOptionsApprovalsResponse401> Client does not exist, you do not have access to the client, or “client_secret” is
   * incorrect.
   *
   * @throws FetchError<403, types.RequestListOptionsApprovalsResponse403> The correspondent entity does not have access to options approvals or the account does
   * not exist.
   *
   */
  requestListOptionsApprovals(metadata?: types.RequestListOptionsApprovalsMetadataParam): Promise<FetchResponse<200, types.RequestListOptionsApprovalsResponse200>> {
    return this.core.fetch('/v1/accounts/options/approvals', 'get', metadata);
  }

  /**
   * This endpoint allows you to query all the account document based on an account ID. You
   * can filter by date, or type of document.
   *
   * These account documents are tax statements, trade confirmations, etc, generated by the
   * Alpaca system. They are distinct from the owner documents you upload and later access
   * via the account object's documents property.
   *
   * @summary Retrieve a List of Account Documents
   * @throws FetchError<404, types.GetDocsForAccountResponse404> Not found
   */
  getDocsForAccount(metadata: types.GetDocsForAccountMetadataParam): Promise<FetchResponse<200, types.GetDocsForAccountResponse200>> {
    return this.core.fetch('/v1/accounts/{account_id}/documents', 'get', metadata);
  }

  /**
   * Upload documents for the primary account owner of an account.
   *
   * Documents are binary objects whose contents are encoded in base64. Each encoded content
   * size is limited to 10MB if you use Alpaca for KYCaaS. If you perform your own KYC there
   * are no document size limitations.
   *
   * As a convenience, documents of type w8ben may be uploaded as a JSON object using the
   * content_data request property. The Alpaca system will then generate a formatted W-8 BEN
   * document for subsequent downloads.
   *
   * Note that these owner documents are distinct from the account documents generated by
   * Alpaca, such as tax statements and trade confirmations.
   *
   * @summary Upload Owner Documents for an Existing Account
   * @throws FetchError<400, types.UploadDocToAccountResponse400> Bad Request. The body in the request is not valid.
   * @throws FetchError<404, types.UploadDocToAccountResponse404> Not Found. No account was found for this account_id
   */
  uploadDocToAccount(body: types.UploadDocToAccountBodyParam, metadata: types.UploadDocToAccountMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/accounts/{account_id}/documents/upload', 'post', body, metadata);
  }

  /**
   * This endpoint downloads an account document based on the document ID. The document will
   * be in PDF format.
   *
   * The operation returns a pre-signed downloadable link as a redirect with HTTP status code
   * 301 if one is found.
   *
   * You can retrieve a JSON version of a monthly statement by passing in the header accept:
   * application/json header.
   *
   * These account documents are tax statements, trade confirmations, etc, generated by the
   * Alpaca system. They are distinct from the owner documents you upload and later access
   * via the account object's documents property.
   *
   * @summary Download an Account Document
   */
  downloadDocFromAccount(metadata: types.DownloadDocFromAccountMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/accounts/{account_id}/documents/{document_id}/download', 'get', metadata);
  }

  /**
   * Retrieves Bank Relationships for an account
   *
   * @summary Retrieve Bank Relationships for an Account
   */
  getRecipientBanks(metadata: types.GetRecipientBanksMetadataParam): Promise<FetchResponse<200, types.GetRecipientBanksResponse200>> {
    return this.core.fetch('/v1/accounts/{account_id}/recipient_banks', 'get', metadata);
  }

  /**
   * If successful, retrieves Bank Relationships for an account
   *
   * @summary Create a Bank Relationship for an Account
   */
  createRecipientBank(body: types.CreateRecipientBankBodyParam, metadata: types.CreateRecipientBankMetadataParam): Promise<FetchResponse<200, types.CreateRecipientBankResponse200>> {
    return this.core.fetch('/v1/accounts/{account_id}/recipient_banks', 'post', body, metadata);
  }

  /**
   * If successful, deletes Bank Relationship for an account
   *
   * @summary Delete a Bank Relationship for an Account
   */
  deleteRecipientBank(metadata: types.DeleteRecipientBankMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/accounts/{account_id}/recipient_banks/{bank_id}', 'delete', metadata);
  }

  /**
   * Returns all overcontributed IRA accounts
   *
   * @summary Retrieve Excess Contributions
   */
  listIRAExcessContritbutions(): Promise<FetchResponse<200, types.ListIraExcessContritbutionsResponse200> | FetchResponse<number, types.ListIraExcessContritbutionsResponseDefault>> {
    return this.core.fetch('/v1/accounts/ira_excess_contributions', 'get');
  }

  /**
   * Create sandbox deposit transfer
   *
   */
  demoDepositFunding(body: types.DemoDepositFundingBodyParam): Promise<FetchResponse<200, types.DemoDepositFundingResponse200> | FetchResponse<number, types.DemoDepositFundingResponseDefault>> {
    return this.core.fetch('/v1beta/demo/banking/funding', 'post', body);
  }

  /**
   * Batch create funding wallets
   *
   */
  batchCreateFundingWallets(body: types.BatchCreateFundingWalletsBodyParam): Promise<FetchResponse<200, types.BatchCreateFundingWalletsResponse200> | FetchResponse<number, types.BatchCreateFundingWalletsResponseDefault>> {
    return this.core.fetch('/v1beta/accounts/funding_wallet', 'post', body);
  }

  /**
   * Retrieve funding wallet
   *
   */
  getFundingWallet(metadata: types.GetFundingWalletMetadataParam): Promise<FetchResponse<200, types.GetFundingWalletResponse200> | FetchResponse<number, types.GetFundingWalletResponseDefault>> {
    return this.core.fetch('/v1beta/accounts/{account_id}/funding_wallet', 'get', metadata);
  }

  /**
   * Creates a funding wallet
   *
   */
  createFundingWallet(metadata: types.CreateFundingWalletMetadataParam): Promise<FetchResponse<200, types.CreateFundingWalletResponse200> | FetchResponse<number, types.CreateFundingWalletResponseDefault>> {
    return this.core.fetch('/v1beta/accounts/{account_id}/funding_wallet', 'post', metadata);
  }

  /**
   * Returns a list of funding details if it exists. Query parameters must be passed to
   * create a new funding details object if none exist.
   *
   * @summary Retrieve funding details
   */
  listFundingDetails(metadata: types.ListFundingDetailsMetadataParam): Promise<FetchResponse<200, types.ListFundingDetailsResponse200> | FetchResponse<number, types.ListFundingDetailsResponseDefault>> {
    return this.core.fetch('/v1beta/accounts/{account_id}/funding_wallet/funding_details', 'get', metadata);
  }

  /**
   * Retrieve funding wallet transfers
   *
   */
  getFundingWalletTransfers(metadata: types.GetFundingWalletTransfersMetadataParam): Promise<FetchResponse<200, types.GetFundingWalletTransfersResponse200> | FetchResponse<number, types.GetFundingWalletTransfersResponseDefault>> {
    return this.core.fetch('/v1beta/accounts/{account_id}/funding_wallet/transfers', 'get', metadata);
  }

  /**
   * Retrieve funding wallet transfer by ID
   *
   */
  getFundingWalletTransferByID(metadata: types.GetFundingWalletTransferByIdMetadataParam): Promise<FetchResponse<200, types.GetFundingWalletTransferByIdResponse200> | FetchResponse<number, types.GetFundingWalletTransferByIdResponseDefault>> {
    return this.core.fetch('/v1beta/accounts/{account_id}/funding_wallet/transfers/{transfer_id}', 'get', metadata);
  }

  /**
   * Retrieve recipient bank
   *
   */
  getFundingWalletRecipientBank(metadata: types.GetFundingWalletRecipientBankMetadataParam): Promise<FetchResponse<number, types.GetFundingWalletRecipientBankResponseDefault>> {
    return this.core.fetch('/v1beta/accounts/{account_id}/funding_wallet/recipient_bank', 'get', metadata);
  }

  /**
   * Creates a new recipient bank. Returns the new recipient bank entity on success. entity.
   *
   * @summary Create a recipient bank
   */
  createFundingWalletRecipientBank(body: types.CreateFundingWalletRecipientBankBodyParam, metadata: types.CreateFundingWalletRecipientBankMetadataParam): Promise<FetchResponse<200, types.CreateFundingWalletRecipientBankResponse200> | FetchResponse<number, types.CreateFundingWalletRecipientBankResponseDefault>> {
    return this.core.fetch('/v1beta/accounts/{account_id}/funding_wallet/recipient_bank', 'post', body, metadata);
  }

  /**
   * deletes a recipient bank.
   *
   * @summary Delete a recipient bank
   */
  deleteFundingWalletRecipientBank(metadata: types.DeleteFundingWalletRecipientBankMetadataParam): Promise<FetchResponse<number, types.DeleteFundingWalletRecipientBankResponseDefault>> {
    return this.core.fetch('/v1beta/accounts/{account_id}/funding_wallet/recipient_bank', 'delete', metadata);
  }

  /**
   * Creates a withdrawal
   *
   * @summary Create a withdrawal
   */
  createFundingWalletWithdrawal(body: types.CreateFundingWalletWithdrawalBodyParam, metadata: types.CreateFundingWalletWithdrawalMetadataParam): Promise<FetchResponse<200, types.CreateFundingWalletWithdrawalResponse200> | FetchResponse<number, types.CreateFundingWalletWithdrawalResponseDefault>> {
    return this.core.fetch('/v1beta/accounts/{account_id}/funding_wallet/withdrawal', 'post', body, metadata);
  }

  /**
   * You can query a list of transfers for an account.
   *
   *
   * You can filter requested transfers by values such as direction and status.
   *
   * Returns a list of transfer entities ordered by created_at
   *
   * @summary Retrieve List of Transfers for an Account.
   */
  getTransfersForAccount(metadata: types.GetTransfersForAccountMetadataParam): Promise<FetchResponse<200, types.GetTransfersForAccountResponse200>> {
    return this.core.fetch('/v1/accounts/{account_id}/transfers', 'get', metadata);
  }

  /**
   * Create a new transfer to an account to fund it.
   *
   * In the sandbox environment, you can instantly deposit to or withdraw from an account
   * with a virtual money amount. In the production environment, this endpoint is used only
   * for requesting an outgoing (withdrawal) wire transfer at this moment. For the wire
   * transfer (in production), you need to create a bank resource first using the Bank API.
   * For more on how to fund an account in sandbox please check out this tutorial
   * [here](https://alpaca.markets/learn/fund-broker-api/).
   *
   * @summary Request a New Transfer
   */
  createTransferForAccount(body: types.CreateTransferForAccountBodyParam, metadata: types.CreateTransferForAccountMetadataParam): Promise<FetchResponse<200, types.CreateTransferForAccountResponse200>> {
    return this.core.fetch('/v1/accounts/{account_id}/transfers', 'post', body, metadata);
  }

  /**
   * Request to close a transfer
   *
   * @summary Request to Close a Transfer
   */
  deleteTransfer(metadata: types.DeleteTransferMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/accounts/{account_id}/transfers/{transfer_id}', 'delete', metadata);
  }

  /**
   * Returns a list of activities
   *
   * Notes:
   * * Pagination is handled using the `page_token` and `page_size` parameters.
   * * `page_token` represents the ID of the last item on your current page of results.
   *    For example, if the ID of the last activity in your first response is
   * `20220203000000000::045b3b8d-c566-4bef-b741-2bf598dd6ae7`, you would pass that value as
   * `page_token` to retrieve the next page of results.
   *
   * * If specified with a `direction` of `desc`, for example, the results will end before
   * the activity with the specified ID.
   * * If specified with a `direction` of `asc`, results will begin with the activity
   * immediately after the one specified.
   * * `page_size` is the maximum number of entries to return in the response.
   * * If `date` is not specified, the default and maximum value is 100.
   * * If `date` is specified, the default behavior is to return all results, and there is no
   * maximum page size.
   *
   * @summary Retrieve Account Activities
   */
  getAccountActivities(metadata?: types.GetAccountActivitiesMetadataParam): Promise<FetchResponse<200, types.GetAccountActivitiesResponse200>> {
    return this.core.fetch('/v1/accounts/activities', 'get', metadata);
  }

  /**
   * Retrieves an Array of Activies by type
   *
   * If {activity_type} is provided as part of the URL, category cannot be provided as query
   * parameter. They are mutually exclusive.
   *
   * Notes:
   * * Pagination is handled using the `page_token` and `page_size` parameters.
   * * `page_token` represents the ID of the end of your current page of results.
   *   for example if in your first response the id of the last Activiy item returned in the
   * array was `20220203000000000::045b3b8d-c566-4bef-b741-2bf598dd6ae7`, you'd pass that
   * value as `page_token` to get the next page of results
   *
   * * If specified with a `direction` of `desc`, for example, the results will end before
   * the activity with the specified ID.
   * * If specified with a `direction` of `asc`, results will begin with the activity
   * immediately after the one specified.
   * * `page_size` is the maximum number of entries to return in the response.
   * * If `date` is not specified, the default and maximum value is 100.
   * * If `date` is specified, the default behavior is to return all results, and there is no
   * maximum page size.
   *
   * @summary Retrieve Account Activities of Specific Type
   */
  getAccountActivitiesByType(metadata: types.GetAccountActivitiesByTypeMetadataParam): Promise<FetchResponse<200, types.GetAccountActivitiesByTypeResponse200>> {
    return this.core.fetch('/v1/accounts/activities/{activity_type}', 'get', metadata);
  }

  /**
   * Returns a list of ACH Relationships for an account
   *
   * @summary Retrieve ACH Relationships for an account
   */
  getAccountACHRelationships(metadata: types.GetAccountAchRelationshipsMetadataParam): Promise<FetchResponse<200, types.GetAccountAchRelationshipsResponse200>> {
    return this.core.fetch('/v1/accounts/{account_id}/ach_relationships', 'get', metadata);
  }

  /**
   * Create a new ACHRelationship for an account
   *
   * If successful, will return 200 code with a newly created ACH Relationship entity.
   *
   * @summary Create an ACH Relationship
   * @throws FetchError<400, types.CreateAchRelationshipForAccountResponse400> Malformed input.
   * @throws FetchError<401, types.CreateAchRelationshipForAccountResponse401> Client is not authorized for this operation.
   * @throws FetchError<409, types.CreateAchRelationshipForAccountResponse409> The account already has an active relationship.
   */
  createACHRelationshipForAccount(body: types.CreateAchRelationshipForAccountBodyParam, metadata: types.CreateAchRelationshipForAccountMetadataParam): Promise<FetchResponse<200, types.CreateAchRelationshipForAccountResponse200>> {
    return this.core.fetch('/v1/accounts/{account_id}/ach_relationships', 'post', body, metadata);
  }

  /**
   * Delete an existing ACH relationship for an account
   *
   * @summary Delete an existing ACH relationship
   */
  deleteACHRelationshipFromAccount(metadata: types.DeleteAchRelationshipFromAccountMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/accounts/{account_id}/ach_relationships/{ach_relationship_id}', 'delete', metadata);
  }

  /**
   * As a broker you can view more trading details about your users.
   *
   * The response is a Trading Account model.
   *
   * @summary Retrieve Trading Details for an Account
   */
  getTradingAccount(metadata: types.GetTradingAccountMetadataParam): Promise<FetchResponse<200, types.GetTradingAccountResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/account', 'get', metadata);
  }

  /**
   * List open positions for an account
   *
   * @summary List Open Positions for an Account
   */
  getPositionsForAccount(metadata: types.GetPositionsForAccountMetadataParam): Promise<FetchResponse<200, types.GetPositionsForAccountResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/positions', 'get', metadata);
  }

  /**
   * Closes (liquidates) all of the account’s open long and short positions. A response will
   * be provided for each order that is attempted to be cancelled. If an order is no longer
   * cancelable, the server will respond with status 500 and reject the request.
   *
   * @summary Close All Positions for an Account
   */
  closeAllPositionsForAccount(metadata: types.CloseAllPositionsForAccountMetadataParam): Promise<FetchResponse<207, types.CloseAllPositionsForAccountResponse207>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/positions', 'delete', metadata);
  }

  /**
   * Retrieves the account’s open position for the given symbol or asset_id.
   *
   * @summary Get an Open Position for account by Symbol or AssetId
   */
  getPositionsForAccountBySymbol(metadata: types.GetPositionsForAccountBySymbolMetadataParam): Promise<FetchResponse<200, types.GetPositionsForAccountBySymbolResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/positions/{symbol_or_asset_id}', 'get', metadata);
  }

  /**
   * Closes (liquidates) the account’s open position for the given symbol. Works for both
   * long and short positions.
   *
   * @summary Close a Position for an Account
   */
  closePositionForAccountBySymbol(metadata: types.ClosePositionForAccountBySymbolMetadataParam): Promise<FetchResponse<200, types.ClosePositionForAccountBySymbolResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/positions/{symbol_or_asset_id}', 'delete', metadata);
  }

  /**
   * Retrieves the account’s pattern day trader status
   *
   * @summary Get Pattern Day Trader Status for account
   */
  pdtGetStatus(metadata: types.PdtGetStatusMetadataParam): Promise<FetchResponse<200, types.PdtGetStatusResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/account/pdt/status', 'get', metadata);
  }

  /**
   * Requests the exercise of pattern day trader one time removal for given account
   *
   * @summary Exercise PDT one time removal
   * @throws FetchError<403, types.PdtOneTimeRemovalResponse403> Forbidden
   *
   * Account is not flagged as PDT.
   */
  pdtOneTimeRemoval(metadata: types.PdtOneTimeRemovalMetadataParam): Promise<FetchResponse<200, types.PdtOneTimeRemovalResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/account/pdt/one-time-removal', 'post', metadata);
  }

  /**
   * This endpoint enables users to exercise a held option contract, converting it into the
   * underlying asset based on the specified terms.
   * All available held shares of this option contract will be exercised.
   * By default, Alpaca will automatically exercise in-the-money (ITM) contracts at expiry.
   * Exercise requests will be processed immediately once received. Exercise requests
   * submitted between market close and midnight will be rejected to avoid any confusion
   * about when the exercise will settle.
   * To cancel an exercise request or to submit a Do-not-exercise (DNE) instruction, you can
   * use the do-not-exercise endpoint or contact our support team.
   *
   * @summary Exercise an Options Position (BETA)
   * @throws FetchError<403, types.OptionExerciseResponse403> Forbidden
   *
   * Available position quantity is not sufficient.
   */
  optionExercise(body: types.OptionExerciseBodyParam, metadata: types.OptionExerciseMetadataParam): Promise<FetchResponse<200, types.OptionExerciseResponse200>>;
  optionExercise(metadata: types.OptionExerciseMetadataParam): Promise<FetchResponse<200, types.OptionExerciseResponse200>>;
  optionExercise(body?: types.OptionExerciseBodyParam | types.OptionExerciseMetadataParam, metadata?: types.OptionExerciseMetadataParam): Promise<FetchResponse<200, types.OptionExerciseResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/positions/{symbol_or_contract_id}/exercise', 'post', body, metadata);
  }

  /**
   * This endpoint enables users to submit a do-not-exercise (DNE) instruction for a held
   * option contract, preventing automatic exercise at expiry.
   * By default, Alpaca will automatically exercise in-the-money (ITM) contracts at expiry.
   * This endpoint allows users to override that behavior.
   * DNE requests will be processed immediately once received. DNE requests submitted between
   * market close and midnight will be rejected to avoid any confusion about when the
   * instruction will take effect.
   * To cancel a DNE request or to submit an exercise instruction, please contact our support
   * team.
   *
   * @summary Do Not Exercise an Options Position (BETA)
   * @throws FetchError<403, types.OptionDoNotExerciseResponse403> Forbidden
   * @throws FetchError<422, types.OptionDoNotExerciseResponse422> Invalid Symbol
   *
   * The specified symbol_or_contract_id is invalid.
   */
  optionDoNotExercise(body: types.OptionDoNotExerciseBodyParam, metadata: types.OptionDoNotExerciseMetadataParam): Promise<FetchResponse<200, types.OptionDoNotExerciseResponse200>>;
  optionDoNotExercise(metadata: types.OptionDoNotExerciseMetadataParam): Promise<FetchResponse<200, types.OptionDoNotExerciseResponse200>>;
  optionDoNotExercise(body?: types.OptionDoNotExerciseBodyParam | types.OptionDoNotExerciseMetadataParam, metadata?: types.OptionDoNotExerciseMetadataParam): Promise<FetchResponse<200, types.OptionDoNotExerciseResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/positions/{symbol_or_contract_id}/do-not-exercise', 'post', body, metadata);
  }

  /**
   * Retrieves a single order for the given order_id.
   *
   * @summary Retrieve an Order by its ID
   * @throws FetchError<400, types.GetOrderForAccountResponse400> Malformed input.
   * @throws FetchError<404, types.GetOrderForAccountResponse404> Resource does not exist.
   */
  getOrderForAccount(metadata: types.GetOrderForAccountMetadataParam): Promise<FetchResponse<200, types.GetOrderForAccountResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/orders/{order_id}', 'get', metadata);
  }

  /**
   * Replaces a single order with updated parameters. Each parameter overrides the
   * corresponding attribute of the existing order. The other attributes remain the same as
   * the existing order.
   *
   * A success return code from a replaced order does NOT guarantee the existing open order
   * has been replaced. If the existing open order is filled before the replacing (new) order
   * reaches the execution venue, the replacing (new) order is rejected, and these events are
   * sent in the trade_updates stream channel found
   * [here](https://docs.alpaca.markets/reference/subscribetotradev2sse).
   *
   * While an order is being replaced, the account's buying power is reduced by the larger of
   * the two orders that have been placed (the old order being replaced, and the newly placed
   * order to replace it). If you are replacing a buy entry order with a higher limit price
   * than the original order, the buying power is calculated based on the newly placed order.
   * If you are replacing it with a lower limit price, the buying power is calculated based
   * on the old order.
   *
   * Note: Order cannot be replaced when the status is `accepted`, `pending_new`,
   * `pending_cancel` or `pending_replace`.
   *
   * @summary Replace an Order
   * @throws FetchError<400, types.ReplaceOrderForAccountResponse400> Malformed input.
   * @throws FetchError<404, types.ReplaceOrderForAccountResponse404> Resource does not exist.
   */
  replaceOrderForAccount(body: types.ReplaceOrderForAccountBodyParam, metadata: types.ReplaceOrderForAccountMetadataParam): Promise<FetchResponse<200, types.ReplaceOrderForAccountResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/orders/{order_id}', 'patch', body, metadata);
  }

  /**
   * Attempts to cancel an open order. If the order is no longer cancelable (for example if
   * the status is "filled"), the server will respond with status 422, and reject the
   * request.
   *
   * Upon acceptance of the cancel request, it returns status 204.
   *
   * @summary Cancel an Open Order
   * @throws FetchError<400, types.DeleteOrderForAccountResponse400> Malformed input.
   * @throws FetchError<404, types.DeleteOrderForAccountResponse404> Resource does not exist.
   */
  deleteOrderForAccount(metadata: types.DeleteOrderForAccountMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/orders/{order_id}', 'delete', metadata);
  }

  /**
   * Retrieves a list of orders for the account, filtered by the supplied query parameters.
   *
   * Endpoint defaults to open orders if no parameters are provided.
   *
   * @summary Retrieve a List of Orders
   * @throws FetchError<400, types.GetAllOrdersForAccountResponse400> Malformed input.
   * @throws FetchError<404, types.GetAllOrdersForAccountResponse404> Resource does not exist.
   */
  getAllOrdersForAccount(metadata: types.GetAllOrdersForAccountMetadataParam): Promise<FetchResponse<200, types.GetAllOrdersForAccountResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/orders', 'get', metadata);
  }

  /**
   * Creating an order for your end customer. Each trading request must pass in the
   * account_id in the URL.
   *
   * - Note that when submitting crypto orders, `market`, `limit` and `stop_limit` orders are
   * supported while the supported `time_in_force` values are `gtc`, and `ioc`.
   * - For equities and crypto we accept fractional orders as well with either `notional` or
   * `qty` provided.
   * - Note that submitting an options order is only available for partners who have been
   * enabled for Options BETA.
   * - In case of Fixed Income, only `market` and `limit` order types with `day`
   * `time_in_force` are supported, and order replacement is not supported.
   * Note that submitting Fixed Income orders is only available for partners who have been
   * enabled for Fixed Income.
   *
   * @summary Create an Order for an Account
   * @throws FetchError<400, types.CreateOrderForAccountResponse400> Malformed input.
   * @throws FetchError<403, types.CreateOrderForAccountResponse403> Request is forbidden
   * @throws FetchError<404, types.CreateOrderForAccountResponse404> Resource does not exist.
   */
  createOrderForAccount(body: types.CreateOrderForAccountBodyParam, metadata: types.CreateOrderForAccountMetadataParam): Promise<FetchResponse<200, types.CreateOrderForAccountResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/orders', 'post', body, metadata);
  }

  /**
   * Attempts to cancel all open orders. A response will be provided for each order that is
   * attempted to be cancelled.
   *
   * @summary Cancel all Open Orders For an Account
   * @throws FetchError<400, types.DeleteAllOrdersForAccountResponse400> Malformed input.
   * @throws FetchError<404, types.DeleteAllOrdersForAccountResponse404> Resource does not exist.
   */
  deleteAllOrdersForAccount(metadata: types.DeleteAllOrdersForAccountMetadataParam): Promise<FetchResponse<207, types.DeleteAllOrdersForAccountResponse207>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/orders', 'delete', metadata);
  }

  /**
   * Returns all assets
   *
   * @summary Retrieve All Assets
   */
  getAssets(metadata?: types.GetAssetsMetadataParam): Promise<FetchResponse<200, types.GetAssetsResponse200>> {
    return this.core.fetch('/v1/assets', 'get', metadata);
  }

  /**
   * Returns the requested asset, if found
   *
   * @summary Retrieve an Asset by ID
   */
  getAssetBySymbolOrId(metadata: types.GetAssetBySymbolOrIdMetadataParam): Promise<FetchResponse<200, types.GetAssetBySymbolOrIdResponse200>> {
    return this.core.fetch('/v1/assets/{symbol_or_asset_id}', 'get', metadata);
  }

  /**
   * Returns all entry-requirements
   *
   * @summary Retrieve Entry Requirements for requested assets
   */
  getAssetEntryRequirements(metadata: types.GetAssetEntryRequirementsMetadataParam): Promise<FetchResponse<200, types.GetAssetEntryRequirementsResponse200>> {
    return this.core.fetch('/v1/assets/entry-requirements', 'get', metadata);
  }

  /**
   * This endpoint allows you to retrieve a list of option contracts based on various
   * filtering criteria.
   * By default only active contracts that expire before the upcoming weekend are returned.
   *
   * @summary Get Option Contracts (BETA)
   */
  getOptionsContracts(metadata?: types.GetOptionsContractsMetadataParam): Promise<FetchResponse<200, types.GetOptionsContractsResponse200>> {
    return this.core.fetch('/v1/options/contracts', 'get', metadata);
  }

  /**
   * Get an option contract by symbol or contract ID. The symbol or id should be passed in as
   * a path parameter.
   *
   * @summary Get an option contract by ID or Symbol (BETA)
   * @throws FetchError<404, types.GetOptionContractSymbolOrIdResponse404> Not Found
   */
  getOptionContractSymbol_or_id(metadata: types.GetOptionContractSymbolOrIdMetadataParam): Promise<FetchResponse<200, types.GetOptionContractSymbolOrIdResponse200>> {
    return this.core.fetch('/v1/options/contracts/{symbol_or_id}', 'get', metadata);
  }

  /**
   * Serves the list of US treasuries available at Alpaca. The response is sorted by ISIN.
   *
   * @summary Get US treasuries
   * @throws FetchError<400, types.UsTreasuriesResponse400> One of the request parameters is invalid. See the returned message for details.
   *
   * @throws FetchError<429, types.UsTreasuriesResponse429> Too many requests. You hit the rate limit. Use the X-RateLimit-... response headers to
   * make sure you're under the rate limit.
   *
   */
  usTreasuries(metadata?: types.UsTreasuriesMetadataParam): Promise<FetchResponse<200, types.UsTreasuriesResponse200>> {
    return this.core.fetch('/v1/assets/fixed_income/us_treasuries', 'get', metadata);
  }

  /**
   * The calendar API serves the full list of market days from 1970 to 2029. It can also be
   * queried by specifying a start and/or end time to narrow down the results. In addition to
   * the dates, the response also contains the specific open and close times for the market
   * days, taking into account early closures.
   *
   * @summary Retrieve the Market Calendar
   */
  queryMarketCalendar(metadata?: types.QueryMarketCalendarMetadataParam): Promise<FetchResponse<200, types.QueryMarketCalendarResponse200>> {
    return this.core.fetch('/v1/calendar', 'get', metadata);
  }

  /**
   * The Clock API serves the current market timestamp, whether or not the market is
   * currently open, as well as the times of the next market open and close.
   *
   * @summary Retrieve the Market Clock
   */
  queryMarketClock(): Promise<FetchResponse<200, types.QueryMarketClockResponse200>> {
    return this.core.fetch('/v1/clock', 'get');
  }

  /**
   * The Country Info API serves country information for every supported countries including
   * risk ratings and supported crypto states where applicable.
   *
   * @summary Retrieve countries information
   */
  queryCountryInfos(): Promise<FetchResponse<200, types.QueryCountryInfosResponse200>> {
    return this.core.fetch('/v1/country-info', 'get');
  }

  /**
   * The accounts events API provides streaming of account changes as they occur, via SSE
   * (server sent events). Past events can also be queried.
   *
   * Events are generated for changes to the following account properties:
   * - account_blocked
   * - admin_configurations
   * - cash_interest
   * - crypto_status
   * - kyc_results
   * - options
   * - pattern_day_trader
   * - status
   * - trading_blocked
   *
   * Only the changed properties are included in the event payload.
   *
   * Query Parameter Rules:
   * - `since` is required if `until` specified
   * - `since_id` is required if `until_id` specified
   * - `since_ulid` is required if `until_ulid` specified
   * - `since`, `since_id` and `since_ulid` can’t be used at the same time
   *
   * Behavior:
   * This API supports querying a range of events, starting now or in the past. If the end of
   * the range is in the future or not specified, the connection is kept open and future
   * events are pushed.
   *
   * To be specific:
   * - if `since`, `since_id` or `since_ulid` is not specified, this will not return any
   * historic data
   * - if `until`, `until_id` or `until_ulid` is reached, the stream will end with a status
   * of 200
   *
   * ---
   *
   * Note for people using the clients generated from this OAS spec. Currently OAS-3 doesn't
   * have full support for representing SSE style responses from an API, so if you are using
   * a generated client and don't specify a `since` and `until` there is a good chance the
   * generated clients will hang waiting for the response to end.
   *
   * If you require the streaming capabilities we recommend not using the generated clients
   * for this specific usecase until the OAS-3 standards come to a consensus on how to
   * represent this correcting in OAS-3.
   *
   * @summary Subscribe to Account Status Events (SSE)
   */
  suscribeToAccountStatusSSE(metadata?: types.SuscribeToAccountStatusSseMetadataParam): Promise<FetchResponse<200, types.SuscribeToAccountStatusSseResponse200>> {
    return this.core.fetch('/v1/events/accounts/status', 'get', metadata);
  }

  /**
   * The Events API provides event push as well as historical queries via SSE (server sent
   * events).
   *
   * You can listen to journal status updates as they get processed by our backoffice.
   *
   * Historical events are streamed immediately if queried, and updates are pushed as events
   * occur.
   *
   * Query Params Rules:
   * - `since` required if `until` specified
   * - `since_id` required if `until_id` specified
   * - `since_ulid` required if `until_ulid` specified
   * - `since`, `since_id` or `since_ulid`  can’t be used at the same time
   * Behavior:
   * - if `since`, `since_id` or `since_ulid` not specified this will not return any historic
   * data
   * - if `until`, `until_id` or `until_ulid` reached stream will end (status 200)
   *
   * ---
   *
   * There is no compatibility between /v1/events/journals/status and
   * /v2/events/journals/status, the ids (ulid) are always different, and the number of
   * events might also different
   *
   * Please note that the new `/v2` endpoint, is the same as, and was originally available
   * under `/v2beta1`.
   * We encourage all customers to adjust their codebase from that interim beta endpoint to
   * the `/v2` stable endpoint.
   * In the near future we will setup permanent redirect from `/v2beta1` to `/v2` before we
   * completely remove the beta endpoint.
   *
   * ---
   *
   * Note for people using the clients generated from this OAS spec. Currently OAS-3 doesn't
   * have full support for representing SSE style responses from an API, so if you are using
   * a generated client and don't specify a `since` and `until` there is a good chance the
   * generated clients will hang waiting for the response to end.
   *
   * If you require the streaming capabilities we recommend not using the generated clients
   * for this specific usecase until the OAS-3 standards come to a consensus on how to
   * represent this correcting in OAS-3.
   *
   * @summary Subscribe to Journal Events (SSE) (Legacy)
   */
  subscribeToJournalStatusSSE(metadata?: types.SubscribeToJournalStatusSseMetadataParam): Promise<FetchResponse<200, types.SubscribeToJournalStatusSseResponse200>> {
    return this.core.fetch('/v1/events/journals/status', 'get', metadata);
  }

  /**
   * The Events API provides event push as well as historical queries via SSE (server sent
   * events).
   *
   * You can listen to journal status updates as they get processed by our backoffice.
   *
   * Historical events are streamed immediately if queried, and updates are pushed as events
   * occur.
   *
   * Query Params Rules:
   * - `since` required if `until` specified
   * - `since_id` required if `until_id` specified
   * - `since` and `since_id` can’t be used at the same time
   * - `until` and `until_id` can’t be used at the same time
   * Behavior:
   * - if `since` or `since_ulid` not specified this will not return any historic data
   * - if `until` or `until_id` reached stream will end (status 200)
   *
   * ---
   *
   * There is no compatibility between /v1/events/journals/status and
   * /v2/events/journals/status, the ids (ulid) are always different, and the number of
   * events might also different
   *
   * Please note that the new `/v2` endpoint, is the same as, and was originally available
   * under `/v2beta1`.
   * We encourage all customers to adjust their codebase from that interim beta endpoint to
   * the `/v2` stable endpoint.
   * In the near future we will setup permanent redirect from `/v2beta1` to `/v2` before we
   * completely remove the beta endpoint.
   *
   * ---
   *
   * Note for people using the clients generated from this OAS spec. Currently OAS-3 doesn't
   * have full support for representing SSE style responses from an API, so if you are using
   * a generated client and don't specify a `since` and `until` there is a good chance the
   * generated clients will hang waiting for the response to end.
   *
   * If you require the streaming capabilities we recommend not using the generated clients
   * for this specific usecase until the OAS-3 standards come to a consensus on how to
   * represent this correcting in OAS-3.
   *
   * @summary Subscribe to Journal Events (SSE)
   */
  subscribeToJournalStatusV2SSE(metadata?: types.SubscribeToJournalStatusV2SseMetadataParam): Promise<FetchResponse<200, types.SubscribeToJournalStatusV2SseResponse200>> {
    return this.core.fetch('/v2/events/journals/status', 'get', metadata);
  }

  /**
   * **Deprecation notice**
   *
   * As part of the deprecation process, the legacy transfer events API is now only available
   * for existing broker-partners at `GET /v1/events/transfers/status` and for compatibility
   * reasons.
   *
   * All new broker partners will not have the option to use the legacy transfer events
   * endpoint.
   *
   * They should integrate with the new `/v2/events/funding/status` endpoint instead.
   *
   * Also, all existing broker partners are now recommended to upgrade to the
   * `/v2/events/funding/status` endpoint, which provides faster event delivery times.
   *
   * ---
   *
   * The Events API provides event push as well as historical queries via SSE (server sent
   * events).
   *
   * You can listen to transfer status updates as they get processed by our backoffice, for
   * both end-user and firm accounts.
   *
   * Historical events are streamed immediately if queried, and updates are pushed as events
   * occur.
   *
   * Query Params Rules:
   * - `since` required if `until` specified
   * - `since_id` required if `until_id` specified
   * - `since_ulid` required if `until_ulid` specified
   * - `since`, `since_id` or `since_ulid`  can’t be used at the same time
   * Behavior:
   * - if `since`, `since_id` or `since_ulid` not specified this will not return any historic
   * data
   * - if `until`, `until_id` or `until_ulid` reached stream will end (status 200)
   *
   * ---
   *
   * Note for people using the clients generated from this OAS spec. Currently OAS-3 doesn't
   * have full support for representing SSE style responses from an API, so if you are using
   * a generated client and don't specify a `since` and `until` there is a good chance the
   * generated clients will hang waiting for the response to end.
   *
   * If you require the streaming capabilities we recommend not using the generated clients
   * for this specific usecase until the OAS-3 standards come to a consensus on how to
   * represent this correcting in OAS-3.
   *
   * @summary Subscribe to Transfer Events (SSE) (Legacy)
   */
  subscribeToTransferStatusSSE(metadata?: types.SubscribeToTransferStatusSseMetadataParam): Promise<FetchResponse<200, types.SubscribeToTransferStatusSseResponse200>> {
    return this.core.fetch('/v1/events/transfers/status', 'get', metadata);
  }

  /**
   * **Deprecation notice**
   *
   * As part of the deprecation process, the legacy trade events API is now only available
   * for existing broker-partners at: `GET /v1/events/trades` only for compatibility reasons.
   *
   * All new broker partners will not have the option for the legacy trade event endpoint.
   *
   * All new broker partners will have to integrate with the new `/v2/events/trades`
   * endpoint.
   *
   * Also, all existing broker partners are now recommended to upgrade to the
   * `/v2/events/trades` endpoint, which provides faster event delivery times.
   *
   * For trade events of MLeg (multi-leg) order, please use the `/v2/events/trades` endpoint.
   *
   * Please note that the new `/v2` endpoint, is the same as, and was originally available
   * under `/v2beta1`.
   * We encourage all customers to adjust their codebase from that interim beta endpoint to
   * the `/v2` stable endpoint.
   * In the near future we will setup permanent redirect from `/v2beta1` to `/v2` before we
   * completely remove the beta endpoint.
   *
   * ---
   *
   * The Events API provides event push as well as historical queries via SSE (server sent
   * events).
   *
   * You can listen to events related to trade updates. Most market trades sent during market
   * hours are filled instantly; you can listen to limit order updates through this endpoint.
   *
   * Historical events are streamed immediately if queried, and updates are pushed as events
   * occur.
   *
   * Query Params Rules:
   * - `since` required if `until` specified
   * - `since_id` required if `until_id` specified
   * - `since_ulid` required if `until_ulid` specified
   * - `since`, `since_id` or `since_ulid`  can’t be used at the same time
   * Behavior:
   * - if `since`, `since_id` or `since_ulid` not specified this will not return any historic
   * data
   * - if `until`, `until_id` or `until_ulid` reached stream will end (status 200)
   *
   * ---
   *
   * Note for people using the clients generated from this OAS spec. Currently OAS-3 doesn't
   * have full support for representing SSE style responses from an API, so if you are using
   * a generated client and don't specify a `since` and `until` there is a good chance the
   * generated clients will hang waiting for the response to end.
   *
   * If you require the streaming capabilities we recommend not using the generated clients
   * for this specific usecase until the OAS-3 standards come to a consensus on how to
   * represent this correcting in OAS-3.
   *
   * ---
   *
   * **Deprecation note**
   *
   * Legacy event id (integer based) is unavailable for new broker partners, and it will be
   * deprecated for existing brokers as well.
   * This deprecation is includes the `since_id` and `until_id` query parameter and the
   * `event_id` field in the response.
   *
   * ---
   *
   * **Common events**
   *
   * These are the events that are the expected results of actions you may have taken by
   * sending API requests.
   *
   * The meaning of the timestamp field changes for each type; the meanings have been
   * specified here for which types the timestamp field will be present.
   *
   * - `accepted` Sent when an order recieved and accepted by Alpaca
   * - `pending_new` Sent when the order has been received by Alpaca and routed to the
   * exchanges, but has not yet been accepted for execution.
   * - `new` Sent when an order has been routed to exchanges for execution.
   * - `fill` Sent when your order has been completely filled.
   *   - timestamp: The time at which the order was filled.
   * - `partial_fill` Sent when a number of shares less than the total remaining quantity on
   * your order has been filled.
   *   - timestamp: The time at which the shares were filled.
   * - `canceled` Sent when your requested cancellation of an order is processed.
   *   - timestamp: The time at which the order was canceled.
   * - `expired` Sent when an order has reached the end of its lifespan, as determined by the
   * order's time in force value.
   *   - timestamp: The time at which the order expired.
   * - `done_for_day` Sent when the order is done executing for the day, and will not receive
   * further updates until the next trading day.
   * - `replaced` Sent when your requested replacement of an order is processed.
   *   - timestamp: The time at which the order was replaced.
   *
   * **Rarer events**
   *
   * These are events that may rarely be sent due to unexpected circumstances on the
   * exchanges. It is unlikely you will need to design your code around them, but you may
   * still wish to account for the possibility that they will occur.
   *
   * - `rejected` Sent when your order has been rejected.
   * - `held` For multi-leg orders, the secondary orders (stop loss, take profit) will enter
   * this state while waiting to be triggered.
   * - `stopped` Sent when your order has been stopped, and a trade is guaranteed for the
   * order, usually at a stated price or better, but has not yet occurred.
   * - `pending_cancel` Sent when the order is awaiting cancellation. Most cancellations will
   * occur without the order entering this state.
   * - `pending_replace` Sent when the order is awaiting replacement.
   * - `calculated` Sent when the order has been completed for the day - it is either filled
   * or done_for_day - but remaining settlement calculations are still pending.
   * - `suspended` Sent when the order has been suspended and is not eligible for trading.
   * - `order_replace_rejected` Sent when the order replace has been rejected.
   * - `order_cancel_rejected` Sent when the order cancel has been rejected.
   * - `trade_bust`: Sent when a previously reported execution has been canceled (“busted”)
   * by the upstream exchange.
   * - `trade_correct`: Sent when a previously reported trade has been corrected. For
   * example, the exchange may have updated the price, quantity, or another execution
   * parameter after the trade was initially reported.
   *
   * @summary Subscribe to Trade Events (SSE) (Legacy)
   */
  subscribeToTradeSSE(metadata?: types.SubscribeToTradeSseMetadataParam): Promise<FetchResponse<200, types.SubscribeToTradeSseResponse200>> {
    return this.core.fetch('/v1/events/trades', 'get', metadata);
  }

  /**
   * The Events API provides event push as well as historical queries via SSE (server sent
   * events).
   *
   * You can listen to events related to trade updates. Most market trades sent during market
   * hours are filled instantly; you can listen to limit order updates through this endpoint.
   *
   * Historical events are streamed immediately if queried, and updates are pushed as events
   * occur.
   *
   * Query Params Rules:
   * - `since` required if `until` specified
   * - `since_id` required if `until_id` specified
   * - `since` and `since_id` can’t be used at the same time
   * Behavior:
   * - if `since` or `since_id` not specified this will not return any historic data
   * - if `until` or `until_id` reached stream will end (status 200)
   *
   * ---
   *
   * Note for people using the clients generated from this OAS spec. Currently OAS-3 doesn't
   * have full support for representing SSE style responses from an API, so if you are using
   * a generated client and don't specify a `since` and `until` there is a good chance the
   * generated clients will hang waiting for the response to end.
   *
   * If you require the streaming capabilities we recommend not using the generated clients
   * for this specific usecase until the OAS-3 standards come to a consensus on how to
   * represent this correcting in OAS-3.
   *
   * ---
   *
   * **Legacy trade events API**
   *
   * **Deprecation notice**
   *
   * As part of the deprecation process,
   * the legacy trade events API is now only available for existing broker-partners at: `GET
   * /v1/events/trades` only for compatibility reasons.
   *
   * All new broker partners will not have the option for the legacy trade event endpoint.
   *
   * All new broker partners will have to integrate with the new `/v2/events/trades`
   * endpoint.
   *
   * Also, all existing broker partners are now recommended to upgrade to the
   * `/v2/events/trades` endpoint, which provides faster event delivery times.
   *
   * The legacy trade events api works the same way as the new one with the exception of the
   * event_id which is an integer except of an ULID. This results in the request’s since_id
   * and until_id are also being integers. This integer is monotonically increasing over time
   * for events.
   *
   * Please note that the new `/v2` endpoint, is the same as, and was originally available
   * under `/v2beta1`.
   * We encourage all customers to adjust their codebase from that interim beta endpoint to
   * the `/v2` stable endpoint.
   * In the near future we will setup permanent redirect from `/v2beta1` to `/v2` before we
   * completely remove the beta endpoint.
   *
   * ---
   *
   * ###  Comment messages
   * According to the SSE specification, any line that starts with a colon is a comment which
   * does not contain data.  It is typically a free text that does not follow any data
   * schema. A few examples mentioned below for comment messages.
   *
   * #####  Slow client
   *
   * The server sends a comment when the client is not consuming messages fast enough.
   * Example: `: you are reading too slowly, dropped 10000 messages`
   *
   * ##### Internal server error
   *
   * An error message is sent as a comment when the server closes the connection on an
   * internal server error (only sent by the v2 and v2beta1 endpoints). Example: `: internal
   * server error`
   *
   * ---
   *
   * **Common events**
   *
   * These are the events that are the expected results of actions you may have taken by
   * sending API requests.
   *
   * The meaning of the timestamp field changes for each type; the meanings have been
   * specified here for which types the timestamp field will be present.
   *
   * - `accepted` Sent when an order recieved and accepted by Alpaca
   * - `pending_new` Sent when the order has been received by Alpaca and routed to the
   * exchanges, but has not yet been accepted for execution.
   * - `new` Sent when an order has been routed to exchanges for execution.
   * - `fill` Sent when your order has been completely filled.
   *   - timestamp: The time at which the order was filled.
   * - `partial_fill` Sent when a number of shares less than the total remaining quantity on
   * your order has been filled.
   *   - timestamp: The time at which the shares were filled.
   * - `canceled` Sent when your requested cancellation of an order is processed.
   *   - timestamp: The time at which the order was canceled.
   * - `expired` Sent when an order has reached the end of its lifespan, as determined by the
   * order's time in force value.
   *   - timestamp: The time at which the order expired.
   * - `done_for_day` Sent when the order is done executing for the day, and will not receive
   * further updates until the next trading day.
   * - `replaced` Sent when your requested replacement of an order is processed.
   *   - timestamp: The time at which the order was replaced.
   *
   * **Rarer events**
   *
   * These are events that may rarely be sent due to unexpected circumstances on the
   * exchanges. It is unlikely you will need to design your code around them, but you may
   * still wish to account for the possibility that they will occur.
   *
   * - `rejected` Sent when your order has been rejected.
   *   - timestamp: The time at which the rejection occurred.
   * - `held` For multi-leg orders, the secondary orders (stop loss, take profit) will enter
   * this state while waiting to be triggered.
   * - `stopped` Sent when your order has been stopped, and a trade is guaranteed for the
   * order, usually at a stated price or better, but has not yet occurred.
   * - `pending_cancel` Sent when the order is awaiting cancellation. Most cancellations will
   * occur without the order entering this state.
   * - `pending_replace` Sent when the order is awaiting replacement.
   * - `calculated` Sent when the order has been completed for the day - it is either filled
   * or done_for_day - but remaining settlement calculations are still pending.
   * - `suspended` Sent when the order has been suspended and is not eligible for trading.
   * - `order_replace_rejected` Sent when the order replace has been rejected.
   * - `order_cancel_rejected` Sent when the order cancel has been rejected.
   * - `trade_bust`: Sent when a previously reported execution has been canceled (“busted”)
   * by the upstream exchange.
   * - `trade_correct`: Sent when a previously reported trade has been corrected. For
   * example, the exchange may have updated the price, quantity, or another execution
   * parameter after the trade was initially reported.
   * - `restated`: Sent when the order is manually modified.
   *
   * @summary Subscribe to Trade Events (SSE)
   */
  subscribeToTradeV2SSE(metadata?: types.SubscribeToTradeV2SseMetadataParam): Promise<FetchResponse<200, types.SubscribeToTradeV2SseResponse200>> {
    return this.core.fetch('/v2/events/trades', 'get', metadata);
  }

  /**
   * The Events API provides event push as well as historical queries via SSE (server sent
   * events).
   *
   * This endpoint streams events related to administrative actions performed by our systems.
   *
   * Historical events are streamed immediately if queried, and updates are pushed as events
   * occur.
   *
   * Query Params Rules:
   * - `since` required if `until` specified
   * - `since_id` required if `until_id` specified
   * - `since` and `since_id` can’t be used at the same time
   * Behavior:
   * - if `since` or `since_id` not specified this will not return any historic data
   * - if `until` or `until_id` reached stream will end (status 200)
   *
   * ---
   *
   * Warning: Currently OAS-3 doesn't have full support for representing SSE style responses
   * from an API.
   *
   * In case the client code is generated from this OAS spec, don't specify a `since` and
   * `until` there is a good chance the generated clients will hang forever waiting for the
   * response to end.
   *
   * If you require the streaming capabilities we recommend not using the generated clients
   * for this specific endpoint until the OAS-3 standards come to a consensus on how to
   * represent this behavior in OAS-3.
   *
   * ---
   *
   * ###  Comment messages
   * According to the SSE specification, any line that starts with a colon is a comment which
   * does not contain data.  It is typically a free text that does not follow any data
   * schema. A few examples mentioned below for comment messages.
   *
   * #####  Slow client
   *
   * The server sends a comment when the client is not consuming messages fast enough.
   * Example: `: you are reading too slowly, dropped 10000 messages`
   *
   * ##### Internal server error
   *
   * An error message is sent as a comment when the server closes the connection on an
   * internal server error (only sent by the v2 and v2beta1 endpoints). Example: `: internal
   * server error`
   *
   * ---
   *
   * **Event Types**
   *
   * - **LegacyNote:** Old free text based admin notes
   * - **Liquidation:** Event for a position liquidation which initialized by an admin
   * - **TransactionCancel:** Event for a manually cancelled transaction
   *
   * @summary Subscribe to Admin Action Events (SSE)
   */
  subscribeToAdminActionSSE(metadata?: types.SubscribeToAdminActionSseMetadataParam): Promise<FetchResponse<200, types.SubscribeToAdminActionSseResponse200>> {
    return this.core.fetch('/v2/events/admin-actions', 'get', metadata);
  }

  /**
   * Returns an array of journal objects.
   *
   * @summary Retrieve a List Journals
   * @throws FetchError<400, types.GetAllJournalsResponse400> One of the parameters is invalid.
   * @throws FetchError<422, types.GetAllJournalsResponse422> Result set exceeds 100,000 records.
   */
  getAllJournals(metadata?: types.GetAllJournalsMetadataParam): Promise<FetchResponse<200, types.GetAllJournalsResponse200>> {
    return this.core.fetch('/v1/journals', 'get', metadata);
  }

  /**
   * A journal can be JNLC (move cash) or JNLS (move shares), dictated by `entry_type`.
   * Generally, journal requests are subject to approval and starts from the `pending`
   * status. The status changes are propagated through the Event API. Under certain
   * conditions agreed for the partner, such journal transactions that meet the criteria are
   * executed right away.
   *
   * @summary Create a Journal
   * @throws FetchError<400, types.CreateJournalResponse400> One of the parameters is invalid.
   * @throws FetchError<403, types.CreateJournalResponse403> The amount requested to move is not available.
   * @throws FetchError<404, types.CreateJournalResponse404> One of the account is not found.
   */
  createJournal(body: types.CreateJournalBodyParam, metadata?: types.CreateJournalMetadataParam): Promise<FetchResponse<200, types.CreateJournalResponse200>> {
    return this.core.fetch('/v1/journals', 'post', body, metadata);
  }

  /**
   * You can only delete a journal if the journal is still in a pending state, if a journal
   * is executed you will not be able to delete. The alternative is to create a mirror
   * journal entry to reverse the flow of funds.
   *
   * @summary Cancel a Pending Journal
   */
  deleteJournalById(metadata: types.DeleteJournalByIdMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/journals/{journal_id}', 'delete', metadata);
  }

  /**
   * You can query a specific journal entry that you submitted to Alpaca by passing into the
   * query the journal_id.
   *
   * Will return a journal entry if a journal entry with journal_id exists, otherwise will
   * throw an error.
   *
   * @summary Retrieve a Single Journal Entry
   */
  getV1JournalsJournal_id(metadata: types.GetV1JournalsJournalIdMetadataParam): Promise<FetchResponse<200, types.GetV1JournalsJournalIdResponse200>> {
    return this.core.fetch('/v1/journals/{journal_id}', 'get', metadata);
  }

  /**
   * You can create a batch of journal requests by using this endpoint. This is enabled on
   * JNLC type Journals for now only.
   *
   * Every single request must be valid for the entire batch operation to succeed.
   *
   * In the case of a successful request, the response will contain an array of journal
   * objects with an extra attribute error_message in the case when a specific account fails
   * to receive a journal.
   *
   * @summary Create a Batch Journal Transaction (One-to-Many)
   */
  createBatchJournal(body: types.CreateBatchJournalBodyParam, metadata?: types.CreateBatchJournalMetadataParam): Promise<FetchResponse<200, types.CreateBatchJournalResponse200>> {
    return this.core.fetch('/v1/journals/batch', 'post', body, metadata);
  }

  /**
   * The endpoint returns the details of OAuth client to display in the authorization page.
   *
   * @summary Get an OAuth client
   * @throws FetchError<401, types.GetOAuthClientResponse401> Client does not exist or you do not have access to the client.
   *
   */
  getOAuthClient(metadata: types.GetOAuthClientMetadataParam): Promise<FetchResponse<200, types.GetOAuthClientResponse200>> {
    return this.core.fetch('/v1/oauth/clients/{client_id}', 'get', metadata);
  }

  /**
   * The operation issues an OAuth code which can be used in the OAuth code flow.
   *
   * @summary Issue an OAuth token
   * @throws FetchError<401, types.IssueOAuthTokenResponse401> Client does not exist, you do not have access to the client, or “client_secret” is
   * incorrect.
   *
   * @throws FetchError<422, types.IssueOAuthTokenResponse422> Redirect URI or scope is invalid.
   *
   */
  issueOAuthToken(body: types.IssueOAuthTokenBodyParam): Promise<FetchResponse<200, types.IssueOAuthTokenResponse200>> {
    return this.core.fetch('/v1/oauth/token', 'post', body);
  }

  /**
   * The operation issues an OAuth code which can be used in the OAuth code flow.
   *
   * @summary Authorize an OAuth Token
   * @throws FetchError<401, types.AuthorizeOAuthTokenResponse401> Client does not exist, you do not have access to the client, or “client_secret” is
   * incorrect.
   *
   * @throws FetchError<422, types.AuthorizeOAuthTokenResponse422> Redirect URI or scope is invalid.
   *
   */
  authorizeOAuthToken(body: types.AuthorizeOAuthTokenBodyParam): Promise<FetchResponse<200, types.AuthorizeOAuthTokenResponse200>> {
    return this.core.fetch('/v1/oauth/authorize', 'post', body);
  }

  /**
   * Fetch a list of all watchlists currently in an account.
   *
   * @summary Retrieve all Watchlists for an Account
   */
  getAllWatchlistsForAccount(metadata: types.GetAllWatchlistsForAccountMetadataParam): Promise<FetchResponse<200, types.GetAllWatchlistsForAccountResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/watchlists', 'get', metadata);
  }

  /**
   * Returns the watchlist object
   *
   * @summary Create a New Watchlist for an Account
   */
  createWatchlistForAccount(body: types.CreateWatchlistForAccountBodyParam, metadata: types.CreateWatchlistForAccountMetadataParam): Promise<FetchResponse<200, types.CreateWatchlistForAccountResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/watchlists', 'post', body, metadata);
  }

  /**
   * Retrieve Watchlist by ID
   *
   * @summary Manage watchlists
   */
  getWatchlistForAccountById(metadata: types.GetWatchlistForAccountByIdMetadataParam): Promise<FetchResponse<200, types.GetWatchlistForAccountByIdResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/watchlists/{watchlist_id}', 'get', metadata);
  }

  /**
   * Replace entirely the set of securities contained in the watchlist while optionally
   * renaming it. Destructive operation.
   *
   * @summary Update a Watchlist
   */
  replaceWatchlistForAccountById(body: types.ReplaceWatchlistForAccountByIdBodyParam, metadata: types.ReplaceWatchlistForAccountByIdMetadataParam): Promise<FetchResponse<200, types.ReplaceWatchlistForAccountByIdResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/watchlists/{watchlist_id}', 'put', body, metadata);
  }

  /**
   * Irrevocably delete a watchlist.
   *
   * @summary Remove a Watchlist
   */
  deleteWatchlistFromAccountById(metadata: types.DeleteWatchlistFromAccountByIdMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/watchlists/{watchlist_id}', 'delete', metadata);
  }

  /**
   * Adds an asset to an existing watchlist.
   *
   * @summary Add an Asset to a Watchlist
   */
  postV1TradingAccountsAccount_idWatchlistsWatchlist_id(body: types.PostV1TradingAccountsAccountIdWatchlistsWatchlistIdBodyParam, metadata: types.PostV1TradingAccountsAccountIdWatchlistsWatchlistIdMetadataParam): Promise<FetchResponse<200, types.PostV1TradingAccountsAccountIdWatchlistsWatchlistIdResponse200>>;
  postV1TradingAccountsAccount_idWatchlistsWatchlist_id(metadata: types.PostV1TradingAccountsAccountIdWatchlistsWatchlistIdMetadataParam): Promise<FetchResponse<200, types.PostV1TradingAccountsAccountIdWatchlistsWatchlistIdResponse200>>;
  postV1TradingAccountsAccount_idWatchlistsWatchlist_id(body?: types.PostV1TradingAccountsAccountIdWatchlistsWatchlistIdBodyParam | types.PostV1TradingAccountsAccountIdWatchlistsWatchlistIdMetadataParam, metadata?: types.PostV1TradingAccountsAccountIdWatchlistsWatchlistIdMetadataParam): Promise<FetchResponse<200, types.PostV1TradingAccountsAccountIdWatchlistsWatchlistIdResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/watchlists/{watchlist_id}', 'post', body, metadata);
  }

  /**
   * This endpoint is deprecated, please use [the new corporate actions
   * endpoint](https://docs.alpaca.markets/reference/corporateactions-1) instead.
   *
   * @summary Retrieve Announcements
   * @throws FetchError<400, types.GetCorporateAnnouncementsResponse400> Malformed input.
   */
  getCorporateAnnouncements(metadata: types.GetCorporateAnnouncementsMetadataParam): Promise<FetchResponse<200, types.GetCorporateAnnouncementsResponse200>> {
    return this.core.fetch('/v1/corporate_actions/announcements', 'get', metadata);
  }

  /**
   * The customer identification program (CIP) API allows you to submit the CIP results
   * received from your KYC provider.
   *
   * The minimum requirements to open an individual financial account are delimited and you
   * must verify the true identity of the account holder at account opening:
   *
   * Name
   * Date of birth
   * Address
   * Identification number (for a U.S. citizen, a taxpayer identification number)
   *
   * @summary Upload CIP information
   */
  postV1AccountsAccount_idCip(body: types.PostV1AccountsAccountIdCipBodyParam, metadata: types.PostV1AccountsAccountIdCipMetadataParam): Promise<FetchResponse<number, unknown>>;
  postV1AccountsAccount_idCip(metadata: types.PostV1AccountsAccountIdCipMetadataParam): Promise<FetchResponse<number, unknown>>;
  postV1AccountsAccount_idCip(body?: types.PostV1AccountsAccountIdCipBodyParam | types.PostV1AccountsAccountIdCipMetadataParam, metadata?: types.PostV1AccountsAccountIdCipMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/accounts/{account_id}/cip', 'post', body, metadata);
  }

  /**
   * You can retrieve the CIP information you’ve submitted for a given account.
   *
   * @summary Retrieve CIP information
   */
  getV1AccountsAccount_idCip(metadata: types.GetV1AccountsAccountIdCipMetadataParam): Promise<FetchResponse<200, types.GetV1AccountsAccountIdCipResponse200>> {
    return this.core.fetch('/v1/accounts/{account_id}/cip', 'get', metadata);
  }

  /**
   * Get an SDK token to activate the Onfido SDK flow within your app. You will have to keep
   * track of the SDK token so you can pass it back when you upload the SDK outcome. We
   * recommend storing the token in memory rather than persistent storage to reduce any
   * unnecessary overhead in your app.
   *
   * @summary Retrieve an Onfido SDK Token
   */
  getV1AccountsAccount_idOnfidoSdkTokens(metadata: types.GetV1AccountsAccountIdOnfidoSdkTokensMetadataParam): Promise<FetchResponse<200, types.GetV1AccountsAccountIdOnfidoSdkTokensResponse200>> {
    return this.core.fetch('/v1/accounts/{account_id}/onfido/sdk/tokens', 'get', metadata);
  }

  /**
   * This request allows you to send Alpaca the result of the Onfido SDK flow in your app. A
   * notification of a successful outcome is required for Alpaca to continue the KYC process.
   *
   * @summary Update the Onfido SDK Outcome
   */
  patchV1AccountsAccount_idOnfidoSdk(body: types.PatchV1AccountsAccountIdOnfidoSdkBodyParam, metadata: types.PatchV1AccountsAccountIdOnfidoSdkMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/accounts/{account_id}/onfido/sdk', 'patch', body, metadata);
  }

  /**
   * This endpoint allows you to download a W-8 BEN document for the primary owner of an
   * account based on the document_id passed as a path parameter. The returned document is in
   * PDF format.
   *
   * For certain individuals, a W-8 BEN form should be submitted at onboarding. If the
   * individual is not a registered U.S. taxpayer (not subject to a W-9), the W-8 BEN form
   * may need to be submitted. The IRS explains which individuals this applies to and
   * provides instructions on completing the form. Every three years, in addition to the
   * calendar year it was signed, a new W-8 BEN form must be submitted.
   *
   * The form can be submitted in JSON, JSONC, PNG, JPEG or PDF. If submitting it in JSON,
   * please see the W-8 BEN completed with the corresponding field names for the API here.
   *
   * Note: The dates collected on the form are in a slightly different format than how they
   * need to be submitted via Accounts API. It is requested by the user on the form in
   * MM-DD-YYYY, but should be submitted as YYYY-MM-DD.
   *
   * @summary Download the W8BEN document for the primary owner of an account
   */
  getV1AccountsAccount_idDocumentsW8benDocument_idDownload(metadata: types.GetV1AccountsAccountIdDocumentsW8BenDocumentIdDownloadMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/accounts/{account_id}/documents/w8ben/{document_id}/download', 'get', metadata);
  }

  /**
   * This endpoint is deprecated, please use [the new corporate actions
   * endpoint](https://docs.alpaca.markets/reference/corporateactions-1) instead.
   *
   * @summary Retrieve a Specific Announcement
   */
  getGETV1Corporate_actionsAnnouncementsId(metadata: types.GetGetv1CorporateActionsAnnouncementsIdMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/corporate_actions/announcements/{id}', 'get', metadata);
  }

  /**
   * The Events API provides event push as well as historical queries via SSE (server sent
   * events).
   *
   * You can listen to non-trading activities updates as they get processed by our
   * backoffice, for both end-user and firm accounts.
   *
   * Historical events are streamed immediately if queried, and updates are pushed as events
   * occur.
   *
   * You can listen to when NTAs are pushed such as CSDs, JNLC (journals) or FEEs.
   *
   * Query Params Rules:
   * - `since` required if `until` specified
   * - `since_id` required if `until_id` specified
   * - `since_ulid` required if `until_ulid` specified
   * - `since`, `since_id` or `since_ulid`  can’t be used at the same time
   * Behavior:
   * - if `since`, `since_id` or `since_ulid` not specified this will not return any historic
   * data
   * - if `until`, `until_id` or `until_ulid` reached stream will end (status 200)'
   *
   * @summary Subscribe to Non-Trading Activities Events (SSE)
   */
  getV1EventsNta(metadata?: types.GetV1EventsNtaMetadataParam): Promise<FetchResponse<200, types.GetV1EventsNtaResponse200>> {
    return this.core.fetch('/v1/events/nta', 'get', metadata);
  }

  /**
   * Returns all JIT reports
   *
   * @summary Retrieve JIT Reports
   */
  getV1TransfersJitReports(metadata: types.GetV1TransfersJitReportsMetadataParam): Promise<FetchResponse<200, types.GetV1TransfersJitReportsResponse200>> {
    return this.core.fetch('/v1/transfers/jit/reports', 'get', metadata);
  }

  /**
   * The JIT Securities daily trading limit is set at the correspondent level and is used as
   * the limit for the total amount due to Alpaca on the date of settlement. The limit in use
   * returns the real time usage of this limit and is calculated by taking the net of trade
   * and non-trade activity inflows and outflows. If the limit in use reaches the daily net
   * limit, further purchasing activity will be halted, however, the limit can be adjusted by
   * reaching out to Alpaca with the proposed new limit and the reason for the change.
   *
   * @summary Retrieve Daily Trading Limits
   */
  getV1TransfersJitLimits(): Promise<FetchResponse<200, types.GetV1TransfersJitLimitsResponse200>> {
    return this.core.fetch('/v1/transfers/jit/limits', 'get');
  }

  /**
   * Returns an array of objects that correspond to each ledger account, each of whichcontain
   * the following attributes.
   *
   * @summary Retrieve JIT Ledgers
   */
  getV1TransfersJitLedgers(): Promise<FetchResponse<200, types.GetV1TransfersJitLedgersResponse200>> {
    return this.core.fetch('/v1/transfers/jit/ledgers', 'get');
  }

  /**
   * Returns an array of objects that correspond to each ledger account.
   *
   * @summary Retrieve JIT Ledger Balances
   */
  getV1TransfersJitLedger_idBalances(metadata: types.GetV1TransfersJitLedgerIdBalancesMetadataParam): Promise<FetchResponse<200, types.GetV1TransfersJitLedgerIdBalancesResponse200>> {
    return this.core.fetch('/v1/transfers/jit/{ledger_id}/balances', 'get', metadata);
  }

  /**
   * You can also create a batch journal request by using the following endpoint. This is
   * enabled on JNLC for now only.
   *
   * Note that if there is an invalid account_id the whole batch operation will be canceled.
   * Every single request must be valid for the entire batch operation to succeed.
   *
   * In the case of a successful request, the response will contain an array of journal
   * objects with an extra attribute error_message in the case when a specific account fails
   * to submit a journal.
   *
   * @summary Create a Reverse Batch Journal Transaction (Many-to-One)
   */
  postV1JournalsReverse_batch(body?: types.PostV1JournalsReverseBatchBodyParam): Promise<FetchResponse<200, types.PostV1JournalsReverseBatchResponse200>> {
    return this.core.fetch('/v1/journals/reverse_batch', 'post', body);
  }

  /**
   * Alpaca’s Logo API serves uniform logo images for select stock and crypto symbols.
   *
   * Note: For Logo API pricing details, reach out to sales@alpaca.markets
   *
   * The API response will return the raw image as a binary
   *
   * @summary Get Logo
   */
  getV1beta1LogosSymbol(metadata: types.GetV1Beta1LogosSymbolMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1beta1/logos/{symbol}', 'get', metadata);
  }

  /**
   * This API endpoint provides reporting data to partners for aggregate common stock and
   * crypto positions across their account base. Partners can view historical snapshots of
   * their holding across their entire account base. Please note that this API utilizes an
   * 8:00 pm (EST) cutoff which aligns with the end of the Securities extended hours trading
   * session as well as Alpaca’s 24 hour Crypto trading window. Additionally, the endpoint
   * supports indexing to help the partner efficiently filter by key information including
   * date and symbol while being able to include or remove firm accounts.
   *
   * @summary Retrieve Aggregate Positions
   */
  getV1ReportingEodAggregate_positions(metadata: types.GetV1ReportingEodAggregatePositionsMetadataParam): Promise<FetchResponse<200, types.GetV1ReportingEodAggregatePositionsResponse200>> {
    return this.core.fetch('/v1/reporting/eod/aggregate_positions', 'get', metadata);
  }

  /**
   * This API retrieves a comprehensive list of end-of-day positions for all accounts.
   * End-of-day (EOD) positions are typically accessible after 4:00 am Eastern Time (ET) on
   * the following day, providing a comprehensive view of the day's closing positions across
   * all accounts.
   * This API currently only supports retrieving EOD positions for the last trading date.
   *
   * @summary Retrieve EOD Positions
   */
  getV1ReportingEodPositions(metadata?: types.GetV1ReportingEodPositionsMetadataParam): Promise<FetchResponse<200, types.GetV1ReportingEodPositionsResponse200>> {
    return this.core.fetch('/v1/reporting/eod/positions', 'get', metadata);
  }

  /**
   * Order estimation endpoint will display, based on user’s account balance, the estimated
   * quantity and price they will receive for their notional order.
   *
   * For LCT - customer’s order will include the Alpaca swap_fee, while correspondent side
   * swap_fee is configurable in the API call. Utilising this API does not result in a real
   * order and after the calculation - the user’s buying power reverts to the previous state.
   *
   * Responses and Errors are the same as with the Orders API
   *
   * Please note that the estimation is based on the market condition at the time of
   * submission and a live order will differ. The output should be considered indicative.
   *
   * **Note:** This does not support Crypto or non-market orders at this time.
   *
   * @summary Estimate an Order
   */
  getV1TradingAccountsAccount_idOrdersEstimation(body: types.GetV1TradingAccountsAccountIdOrdersEstimationBodyParam, metadata: types.GetV1TradingAccountsAccountIdOrdersEstimationMetadataParam): Promise<FetchResponse<200, types.GetV1TradingAccountsAccountIdOrdersEstimationResponse200>>;
  getV1TradingAccountsAccount_idOrdersEstimation(metadata: types.GetV1TradingAccountsAccountIdOrdersEstimationMetadataParam): Promise<FetchResponse<200, types.GetV1TradingAccountsAccountIdOrdersEstimationResponse200>>;
  getV1TradingAccountsAccount_idOrdersEstimation(body?: types.GetV1TradingAccountsAccountIdOrdersEstimationBodyParam | types.GetV1TradingAccountsAccountIdOrdersEstimationMetadataParam, metadata?: types.GetV1TradingAccountsAccountIdOrdersEstimationMetadataParam): Promise<FetchResponse<200, types.GetV1TradingAccountsAccountIdOrdersEstimationResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/orders/estimation', 'post', body, metadata);
  }

  /**
   * Retrieves a list of the account’s open positions.
   * This endpoint is deprecated and will be removed in the future. Please use the [GET
   * /v1/reporting/eod/positions
   * endpoint](https://docs.alpaca.markets/reference/get-v1-reporting-eod-positions-1)
   * instead.
   *
   * @summary Bulk Fetch All Accounts Positions
   */
  getV1AccountsPositions(metadata?: types.GetV1AccountsPositionsMetadataParam): Promise<FetchResponse<200, types.GetV1AccountsPositionsResponse200>> {
    return this.core.fetch('/v1/accounts/positions', 'get', metadata);
  }

  /**
   * Returns timeseries data about equity and profit/loss (P/L) of the account in requested
   * timespan.
   *
   * @summary Get Account Portfolio History
   */
  getV1TradingAccountsAccount_idAccountPortfolioHistory(metadata: types.GetV1TradingAccountsAccountIdAccountPortfolioHistoryMetadataParam): Promise<FetchResponse<200, types.GetV1TradingAccountsAccountIdAccountPortfolioHistoryResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/account/portfolio/history', 'get', metadata);
  }

  /**
   * Delete one entry for an asset by symbol name
   *
   * @summary Remove a Symbol from a Watchlist
   */
  deleteDELETEV1TradingAccountsAccount_idWatchlistsWatchlist_idSymbol(metadata: types.DeleteDeletev1TradingAccountsAccountIdWatchlistsWatchlistIdSymbolMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/watchlists/{watchlist_id}/{symbol}', 'delete', metadata);
  }

  /**
   * You can also set the margin settings for your users’ account by passing a PATCH request.
   * By default any account with funds under $2,000 is set a margin multiplier of 1.0, and
   * accounts with over $2,000 are set to 2.0.
   *
   * @summary Update Trading Configurations for an Account
   */
  patchPATCHV1TradingAccountsAccount_idAccountConfigurations(body: types.PatchPatchv1TradingAccountsAccountIdAccountConfigurationsBodyParam, metadata: types.PatchPatchv1TradingAccountsAccountIdAccountConfigurationsMetadataParam): Promise<FetchResponse<200, types.PatchPatchv1TradingAccountsAccountIdAccountConfigurationsResponse200>>;
  patchPATCHV1TradingAccountsAccount_idAccountConfigurations(metadata: types.PatchPatchv1TradingAccountsAccountIdAccountConfigurationsMetadataParam): Promise<FetchResponse<200, types.PatchPatchv1TradingAccountsAccountIdAccountConfigurationsResponse200>>;
  patchPATCHV1TradingAccountsAccount_idAccountConfigurations(body?: types.PatchPatchv1TradingAccountsAccountIdAccountConfigurationsBodyParam | types.PatchPatchv1TradingAccountsAccountIdAccountConfigurationsMetadataParam, metadata?: types.PatchPatchv1TradingAccountsAccountIdAccountConfigurationsMetadataParam): Promise<FetchResponse<200, types.PatchPatchv1TradingAccountsAccountIdAccountConfigurationsResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/account/configurations', 'patch', body, metadata);
  }

  /**
   * Lists portfolios.
   *
   * When more than one query parameter is passed, only portfolios meeting all provided
   * values will be returned (logical AND between parameter values).
   *
   * @summary List Portfolios
   */
  getV1RebalancingPortfolios(metadata?: types.GetV1RebalancingPortfoliosMetadataParam): Promise<FetchResponse<200, types.GetV1RebalancingPortfoliosResponse200>> {
    return this.core.fetch('/v1/rebalancing/portfolios', 'get', metadata);
  }

  /**
   * Creates a portfolio allocation containing securities and/or cash. Having no rebalancing
   * conditions is allowed but the rebalance event would need to be triggered manually.
   * Portfolios created with API may have multiple rebalance_conditions, but only one of type
   * calendar.
   *
   * @summary Create Portfolio
   */
  postV1RebalancingPortfolios(body?: types.PostV1RebalancingPortfoliosBodyParam): Promise<FetchResponse<200, types.PostV1RebalancingPortfoliosResponse200>> {
    return this.core.fetch('/v1/rebalancing/portfolios', 'post', body);
  }

  /**
   * Get a portfolio by its ID.
   *
   * @summary Get Portfolio by ID
   */
  getV1RebalancingPortfoliosPortfolio_id(metadata: types.GetV1RebalancingPortfoliosPortfolioIdMetadataParam): Promise<FetchResponse<200, types.GetV1RebalancingPortfoliosPortfolioIdResponse200>> {
    return this.core.fetch('/v1/rebalancing/portfolios/{portfolio_id}', 'get', metadata);
  }

  /**
   * Updates a portfolio. If weights or conditions are changed, all subscribed accounts will
   * be evaluated for rebalancing at the next opportunity (normal market hours). If a
   * cooldown is active on the portfolio, the rebalancing will occur after the cooldown
   * expired.
   *
   * @summary Update Portfolio by ID
   */
  patchV1RebalancingPortfoliosPortfolio_id(body: types.PatchV1RebalancingPortfoliosPortfolioIdBodyParam, metadata: types.PatchV1RebalancingPortfoliosPortfolioIdMetadataParam): Promise<FetchResponse<200, types.PatchV1RebalancingPortfoliosPortfolioIdResponse200>> {
    return this.core.fetch('/v1/rebalancing/portfolios/{portfolio_id}', 'patch', body, metadata);
  }

  /**
   * Sets a portfolio to “inactive”, so it can be filtered out of the list request. Only
   * permitted if there are no active subscriptions to this portfolio and this portfolio is
   * not a listed in the weights of any active portfolios.
   *
   * Inactive portfolios cannot be linked in new subscriptions or added as weights to new
   * portfolios.
   *
   * @summary Inactivate Portfolio By ID
   */
  deleteV1RebalancingPortfoliosPortfolio_id(metadata: types.DeleteV1RebalancingPortfoliosPortfolioIdMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/rebalancing/portfolios/{portfolio_id}', 'delete', metadata);
  }

  /**
   * Lists subscriptions
   *
   * @summary List All Subscriptions
   */
  getV1RebalancingSubscriptions(metadata?: types.GetV1RebalancingSubscriptionsMetadataParam): Promise<FetchResponse<200, types.GetV1RebalancingSubscriptionsResponse200>> {
    return this.core.fetch('/v1/rebalancing/subscriptions', 'get', metadata);
  }

  /**
   * Creates a subscription between an account and a portfolio.
   *
   * @summary Create Subscription
   */
  postV1RebalancingSubscriptions(body?: types.PostV1RebalancingSubscriptionsBodyParam): Promise<FetchResponse<200, types.PostV1RebalancingSubscriptionsResponse200>> {
    return this.core.fetch('/v1/rebalancing/subscriptions', 'post', body);
  }

  /**
   * Get a subscription by its ID.
   *
   * @summary Get Subscription by ID
   */
  getV1RebalancingSubscriptionsSubscription_id(metadata: types.GetV1RebalancingSubscriptionsSubscriptionIdMetadataParam): Promise<FetchResponse<200, types.GetV1RebalancingSubscriptionsSubscriptionIdResponse200>> {
    return this.core.fetch('/v1/rebalancing/subscriptions/{subscription_id}', 'get', metadata);
  }

  /**
   * Deletes the subscription which stops the rebalancing of an account.
   *
   * @summary Unsubscribe Account (Delete Subscription)
   */
  deleteV1RebalancingSubscriptionsSubscription_id(metadata: types.DeleteV1RebalancingSubscriptionsSubscriptionIdMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/rebalancing/subscriptions/{subscription_id}', 'delete', metadata);
  }

  /**
   * Lists runs.
   *
   * @summary List All Runs
   */
  getV1RebalancingRuns(metadata?: types.GetV1RebalancingRunsMetadataParam): Promise<FetchResponse<200, types.GetV1RebalancingRunsResponse200>> {
    return this.core.fetch('/v1/rebalancing/runs', 'get', metadata);
  }

  /**
   * Manually creates a run.
   *
   * The determination of a run’s orders and the execution of a run take place during normal
   * market hours
   *
   * Runs can be initiated either by the system (when the system evaluates the rebalance
   * conditions specified at the portfolio level) or by API call (manual run creation using
   * POST /v1/rebalancing/runs). Runs can be initiated manually outside of the normal market
   * hours but will remain in the QUEUED status until normal market hours
   *
   * Only 1 run in a non-terminal status is allowed at any time.
   *
   * Manually executing a run is currently only allowed for accounts who do not have an
   * active subscription.
   *
   * @summary Create Run (Manual rebalancing event)
   */
  postV1RebalancingRuns(body?: types.PostV1RebalancingRunsBodyParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/rebalancing/runs', 'post', body);
  }

  /**
   * Get a run by its ID.
   *
   * @summary Get Run by ID
   */
  getV1RebalancingRunsRun_id(metadata: types.GetV1RebalancingRunsRunIdMetadataParam): Promise<FetchResponse<200, types.GetV1RebalancingRunsRunIdResponse200>> {
    return this.core.fetch('/v1/rebalancing/runs/{run_id}', 'get', metadata);
  }

  /**
   * Cancels a run. Only runs within certain statuses (QUEUED, CANCELED, SELLS_IN_PROGRESS,
   * BUYS_IN_PROGRESS) are cancelable. If this endpoint is called after orders have been
   * submitted, we’ll attempt to cancel the orders.
   *
   * @summary Cancel Run by ID
   */
  deleteV1RebalancingRunsRun_id(metadata: types.DeleteV1RebalancingRunsRunIdMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/rebalancing/runs/{run_id}', 'delete', metadata);
  }

  /**
   * This operation closes an active account. The underlying records and information of the
   * account are not deleted by this operation.
   *
   * **Before closing an account, you are responsible for closing all the positions and
   * withdrawing all the money associated with that account. Learn more in the Positions
   * Documentation.**
   *
   * @summary Close an Account
   */
  postV1AccountsAccount_idActionsClose(metadata: types.PostV1AccountsAccountIdActionsCloseMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/accounts/{account_id}/actions/close', 'post', metadata);
  }

  /**
   * Lists wallets for the account given in the path parameter. If an asset is specified and
   * no wallet for the account and asset pair exists one will be created. If no asset is
   * specified only existing wallets will be listed for the account. An account may have at
   * most one wallet per asset.
   *
   * @summary Retrieve Crypto Funding Wallets
   */
  listCryptoFundingWallets(metadata: types.ListCryptoFundingWalletsMetadataParam): Promise<FetchResponse<200, types.ListCryptoFundingWalletsResponse200> | FetchResponse<number, types.ListCryptoFundingWalletsResponseDefault>> {
    return this.core.fetch('/v1/accounts/{account_id}/wallets', 'get', metadata);
  }

  /**
   * Returns an array of all transfers associated with the given account across all wallets.
   *
   * @summary Retrieve Crypto Funding Transfers
   */
  listCryptoFundingTransfers(metadata: types.ListCryptoFundingTransfersMetadataParam): Promise<FetchResponse<200, types.ListCryptoFundingTransfersResponse200> | FetchResponse<number, types.ListCryptoFundingTransfersResponseDefault>> {
    return this.core.fetch('/v1/accounts/{account_id}/wallets/transfers', 'get', metadata);
  }

  /**
   * Creates a withdrawal request. Note that outgoing withdrawals must be sent to a
   * whitelisted address and you must whitelist addresses at least 24 hours in advance. If
   * you attempt to withdraw funds to a non-whitelisted address then the transfer will be
   * rejected.
   *
   * @summary Request a New Withdrawal
   */
  createCryptoTransferForAccount(body: types.CreateCryptoTransferForAccountBodyParam, metadata: types.CreateCryptoTransferForAccountMetadataParam): Promise<FetchResponse<200, types.CreateCryptoTransferForAccountResponse200>> {
    return this.core.fetch('/v1/accounts/{account_id}/wallets/transfers', 'post', body, metadata);
  }

  /**
   * Returns a specific wallet transfer by passing into the query the transfer_id.
   *
   * @summary Retrieve a Crypto Funding Transfer
   */
  getCryptoFundingTransfer(metadata: types.GetCryptoFundingTransferMetadataParam): Promise<FetchResponse<200, types.GetCryptoFundingTransferResponse200>> {
    return this.core.fetch('/v1/accounts/{account_id}/wallets/transfers/{transfer_id}', 'get', metadata);
  }

  /**
   * An array of whitelisted addresses
   *
   */
  listWhitelistedAddress(metadata: types.ListWhitelistedAddressMetadataParam): Promise<FetchResponse<200, types.ListWhitelistedAddressResponse200> | FetchResponse<number, types.ListWhitelistedAddressResponseDefault>> {
    return this.core.fetch('/v1/accounts/{account_id}/wallets/whitelists', 'get', metadata);
  }

  /**
   * Request a new whitelisted address
   *
   */
  createWhitelistedAddress(body: types.CreateWhitelistedAddressBodyParam, metadata: types.CreateWhitelistedAddressMetadataParam): Promise<FetchResponse<200, types.CreateWhitelistedAddressResponse200>> {
    return this.core.fetch('/v1/accounts/{account_id}/wallets/whitelists', 'post', body, metadata);
  }

  /**
   * Delete a whitelisted address
   *
   */
  deleteWhitelistedAddress(metadata: types.DeleteWhitelistedAddressMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/accounts/{account_id}/wallets/whitelists/{whitelisted_address_id}', 'delete', metadata);
  }

  /**
   * Returns the estimated gas fee for a proposed transaction.
   *
   */
  getCryptoTransferEstimate(metadata?: types.GetCryptoTransferEstimateMetadataParam): Promise<FetchResponse<200, types.GetCryptoTransferEstimateResponse200> | FetchResponse<number, types.GetCryptoTransferEstimateResponseDefault>> {
    return this.core.fetch('/v1/wallets/fees/estimate', 'get', metadata);
  }

  /**
   * This endpoint is only available to accounts with the trading limits feature enabled, and
   * not on JIT.
   * The daily trading limit is set at the correspondent level (or the account level) and is
   * used as the limit for the total amount due to Alpaca on the date of settlement.
   * The limit in use returns the real time usage of this limit, based on the setup it uses
   * the usage is calculated differently.
   * If the limit in use reaches the `daily_net_limit` or `available` is zero, further
   * purchasing activity will be halted, however, the limit can be adjusted by reaching out
   * to Alpaca with the proposed new limit and the reason for the change.
   *
   * @summary Retrieve real-time Trading Limits for an Account
   */
  getV1AccountTradingLimits(metadata: types.GetV1AccountTradingLimitsMetadataParam): Promise<FetchResponse<200, types.GetV1AccountTradingLimitsResponse200>> {
    return this.core.fetch('/v1/trading/accounts/{account_id}/limits', 'get', metadata);
  }

  /**
   * Returns a list of instant funding records based on the query parameters. The results are
   * paginated, sorted, and filtered based on the parameters provided.
   *
   * @summary Get Instant Funding List
   */
  getV1InstantFundingList(metadata?: types.GetV1InstantFundingListMetadataParam): Promise<FetchResponse<200, types.GetV1InstantFundingListResponse200> | FetchResponse<number, types.GetV1InstantFundingListResponseDefault>> {
    return this.core.fetch('/v1/instant_funding', 'get', metadata);
  }

  /**
   * Creates an instant funding request. The request will be processed and the funds will be
   * made available to the account in the form of a Memopost non trade activity. Upon
   * settlement
   * the Memoposted will be corrected to a CSD activity.
   *
   * @summary Create an intant funding request
   */
  postV1InstantFunding(body: types.PostV1InstantFundingBodyParam): Promise<FetchResponse<200, types.PostV1InstantFundingResponse200> | FetchResponse<number, types.PostV1InstantFundingResponseDefault>> {
    return this.core.fetch('/v1/instant_funding', 'post', body);
  }

  /**
   * Returns an instant funding transfer based on the ID supplied.
   *
   * @summary Get an instant funding request
   */
  getV1InstantFundingSingle(metadata: types.GetV1InstantFundingSingleMetadataParam): Promise<FetchResponse<200, types.GetV1InstantFundingSingleResponse200> | FetchResponse<number, types.GetV1InstantFundingSingleResponseDefault>> {
    return this.core.fetch('/v1/instant_funding/{instant_funding_id}', 'get', metadata);
  }

  /**
   * Cancels a single instant funding request based on the ID supplied if possible.
   *
   * @summary Cancel an instant funding request
   */
  deleteV1InstantFundingSingle(metadata: types.DeleteV1InstantFundingSingleMetadataParam): Promise<FetchResponse<number, types.DeleteV1InstantFundingSingleResponseDefault>> {
    return this.core.fetch('/v1/instant_funding/{instant_funding_id}', 'delete', metadata);
  }

  /**
   * Returns all settlements filtered by status if provided.
   *
   * @summary List settlements
   */
  getV1InstantFundingSettlements(metadata?: types.GetV1InstantFundingSettlementsMetadataParam): Promise<FetchResponse<200, types.GetV1InstantFundingSettlementsResponse200> | FetchResponse<number, types.GetV1InstantFundingSettlementsResponseDefault>> {
    return this.core.fetch('/v1/instant_funding/settlements', 'get', metadata);
  }

  /**
   * Creates a new settlement, which will trigger the reconciliation process for all included
   * transfers and their interests.
   *
   * @summary Create a new settlement
   */
  postV1InstantFundingSettlements(body: types.PostV1InstantFundingSettlementsBodyParam): Promise<FetchResponse<200, types.PostV1InstantFundingSettlementsResponse200> | FetchResponse<number, types.PostV1InstantFundingSettlementsResponseDefault>> {
    return this.core.fetch('/v1/instant_funding/settlements', 'post', body);
  }

  /**
   * Returns the settlement specified by the path parameter.
   *
   * @summary Get a single settlement
   */
  getV1InstantFundingSettlementsSingle(metadata: types.GetV1InstantFundingSettlementsSingleMetadataParam): Promise<FetchResponse<200, types.GetV1InstantFundingSettlementsSingleResponse200> | FetchResponse<number, types.GetV1InstantFundingSettlementsSingleResponseDefault>> {
    return this.core.fetch('/v1/instant_funding/settlements/{settlement_id}', 'get', metadata);
  }

  /**
   * Returns globally configured limits for the correspondent. These limits are used to
   * determine
   * the maximum amount that can be extended to all accounts, and reaching this limit will
   * result
   * in further requests to create instant funding requests being rejected.
   *
   * @summary Get instant funding limits
   */
  getV1InstantFundingCorrespondentLimits(): Promise<FetchResponse<200, types.GetV1InstantFundingCorrespondentLimitsResponse200> | FetchResponse<number, types.GetV1InstantFundingCorrespondentLimitsResponseDefault>> {
    return this.core.fetch('/v1/instant_funding/limits', 'get');
  }

  /**
   * Returns the limits for individual partner accounts.
   *
   * @summary Get instant funding account limits
   */
  getV1InstantFundingAccountLimits(metadata: types.GetV1InstantFundingAccountLimitsMetadataParam): Promise<FetchResponse<200, types.GetV1InstantFundingAccountLimitsResponse200> | FetchResponse<number, types.GetV1InstantFundingAccountLimitsResponseDefault>> {
    return this.core.fetch('/v1/instant_funding/limits/accounts', 'get', metadata);
  }

  /**
   * Returns instant funding reports which are to be used for daily reconciliation reporting.
   *
   * @summary Get instant funding report
   */
  getV1InstantFundingReports(metadata?: types.GetV1InstantFundingReportsMetadataParam): Promise<FetchResponse<200, types.GetV1InstantFundingReportsResponse200> | FetchResponse<number, types.GetV1InstantFundingReportsResponseDefault>> {
    return this.core.fetch('/v1/instant_funding/reports', 'get', metadata);
  }

  /**
   * Returns all JIT settlements filtered by status if provided.
   *
   * @summary List all JIT Settlements
   */
  getV1JitSettlements(metadata?: types.GetV1JitSettlementsMetadataParam): Promise<FetchResponse<200, types.GetV1JitSettlementsResponse200> | FetchResponse<number, types.GetV1JitSettlementsResponseDefault>> {
    return this.core.fetch('/v1/jit/settlements', 'get', metadata);
  }

  /**
   * Creates a new JIT settlement, which will trigger the reconciliation process for all
   * included accounts.
   *
   * @summary Create a new JIT settlement
   */
  postV1JitSettlements(body: types.PostV1JitSettlementsBodyParam): Promise<FetchResponse<200, types.PostV1JitSettlementsResponse200> | FetchResponse<number, types.PostV1JitSettlementsResponseDefault>> {
    return this.core.fetch('/v1/jit/settlements', 'post', body);
  }

  /**
   * Returns the JIT settlement specified by the path parameter.
   *
   * @summary Get a single JIT settlement
   */
  getV1JitSettlementsSingle(metadata: types.GetV1JitSettlementsSingleMetadataParam): Promise<FetchResponse<200, types.GetV1JitSettlementsSingleResponse200> | FetchResponse<number, types.GetV1JitSettlementsSingleResponseDefault>> {
    return this.core.fetch('/v1/jit/settlements/{settlement_id}', 'get', metadata);
  }

  /**
   * List all available APR tiers. These tiers may be assigned to an account, and will be
   * used to determine the interest rate paid on uninvested cash balances.
   *
   * @summary List APR Tiers
   * @throws FetchError<401, types.GetV1ListAprTiersResponse401> Unauthorized. Please check your API key and try again.
   * @throws FetchError<429, types.GetV1ListAprTiersResponse429> Too many requests. Please wait a moment and try again.
   * @throws FetchError<500, types.GetV1ListAprTiersResponse500> A server error occurred. Please contact Alpaca.
   */
  getV1ListAprTiers(): Promise<FetchResponse<200, types.GetV1ListAprTiersResponse200>> {
    return this.core.fetch('/v1/cash_interest/apr_tiers', 'get');
  }

  /**
   * This API retrieves a list of cash interest details for the given date(s) for a single
   * account or all accounts. End-of-day (EOD) details are typically accessible after 8:00pm
   * Eastern Time (ET) and reflect that day’s ending state across cash balances, accrued
   * interest, accrued fees, as well as additional ancillary details.
   *
   * @summary Retrieve EOD Cash Interest Details
   * @throws FetchError<400, types.GetV1GetEodCashInterestReportResponse400> A client error occurred. Please check the provided request parameters and try again.
   * @throws FetchError<401, types.GetV1GetEodCashInterestReportResponse401> Unauthorized. Please check your API key and try again.
   * @throws FetchError<429, types.GetV1GetEodCashInterestReportResponse429> Too many requests. Please wait a moment and try again.
   * @throws FetchError<500, types.GetV1GetEodCashInterestReportResponse500> A server error occurred. Please contact Alpaca.
   */
  getV1GetEodCashInterestReport(metadata?: types.GetV1GetEodCashInterestReportMetadataParam): Promise<FetchResponse<200, types.GetV1GetEodCashInterestReportResponse200>> {
    return this.core.fetch('/v1/reporting/eod/cash_interest', 'get', metadata);
  }

  /**
   * List all available FPSL tiers. These tiers may be assigned to an account.
   *
   * @summary List FPSL Tiers
   * @throws FetchError<401, types.GetV1ListFpslTiersResponse401> Unauthorized. Please check your API key and try again.
   * @throws FetchError<429, types.GetV1ListFpslTiersResponse429> Too many requests. Please wait a moment and try again.
   * @throws FetchError<500, types.GetV1ListFpslTiersResponse500> A server error occurred. Please contact Alpaca.
   */
  getV1ListFpslTiers(): Promise<FetchResponse<200, types.GetV1ListFpslTiersResponse200>> {
    return this.core.fetch('/v1/fpsl/tiers', 'get');
  }

  /**
   * Returns a list of all FPSL loans that match the specified filter criteria, ordered in
   * ascending order by `date`, `account_number`, and `symbol`. Each entry represents a loan
   * of a `symbol` on a given `date`, made on behalf of the specified `account_number`.
   *
   * @summary List FPSL Loans
   * @throws FetchError<400, types.GetV1ListFpslLoansResponse400> One of the request parameters is invalid. See the returned message for details.
   * @throws FetchError<401, types.GetV1ListFpslLoansResponse401> Authentication headers are missing or invalid. Make sure you authenticate your request
   * with a valid API key.
   * @throws FetchError<403, types.GetV1ListFpslLoansResponse403> User has no access to a resource.
   * @throws FetchError<500, types.GetV1ListFpslLoansResponse500> Internal server error. We recommend retrying these later. If the issue persists, please
   * contact us on Slack or on the Community Forum.
   */
  getV1ListFpslLoans(metadata?: types.GetV1ListFpslLoansMetadataParam): Promise<FetchResponse<200, types.GetV1ListFpslLoansResponse200>> {
    return this.core.fetch('/v1/fpsl/loans', 'get', metadata);
  }

  /**
   * The Events API provides event push as well as historical queries via SSE (server sent
   * events).
   *
   * You can listen to funding status updates as they get processed by our backoffice, for
   * both end-user and firm accounts.
   *
   * Historical events are streamed immediately if queried, and updates are pushed as events
   * occur.
   *
   * Query Params Rules:
   * - `since` required if `until` specified
   * - `since_id` required if `until_id` specified
   * - `since_ulid` required if `until_ulid` specified
   * - `since`, `since_id` or `since_ulid`  can’t be used at the same time
   * Behavior:
   * - if `since`, `since_id` or `since_ulid` not specified this will not return any historic
   * data
   * - if `until`, `until_id` or `until_ulid` reached stream will end (status 200)
   *
   * ---
   *
   * Note for people using the clients generated from this OAS spec. Currently OAS-3 doesn't
   * have full support for representing SSE style responses from an API, so if you are using
   * a generated client and don't specify a `since` and `until` there is a good chance the
   * generated clients will hang waiting for the response to end.
   *
   * If you require the streaming capabilities we recommend not using the generated clients
   * for this specific usecase until the OAS-3 standards come to a consensus on how to
   * represent this correcting in OAS-3.
   *
   * @summary Subscribe to Funding Status Events (SSE)
   */
  subscribeToFundingStatusSSE(metadata?: types.SubscribeToFundingStatusSseMetadataParam): Promise<FetchResponse<200, types.SubscribeToFundingStatusSseResponse200>> {
    return this.core.fetch('/v2/events/funding/status', 'get', metadata);
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { AuthorizeOAuthTokenBodyParam, AuthorizeOAuthTokenResponse200, AuthorizeOAuthTokenResponse401, AuthorizeOAuthTokenResponse422, BatchCreateFundingWalletsBodyParam, BatchCreateFundingWalletsResponse200, BatchCreateFundingWalletsResponseDefault, CloseAllPositionsForAccountMetadataParam, CloseAllPositionsForAccountResponse207, ClosePositionForAccountBySymbolMetadataParam, ClosePositionForAccountBySymbolResponse200, CreateAccountBodyParam, CreateAccountResponse200, CreateAccountResponse400, CreateAccountResponse422, CreateAchRelationshipForAccountBodyParam, CreateAchRelationshipForAccountMetadataParam, CreateAchRelationshipForAccountResponse200, CreateAchRelationshipForAccountResponse400, CreateAchRelationshipForAccountResponse401, CreateAchRelationshipForAccountResponse409, CreateBatchJournalBodyParam, CreateBatchJournalMetadataParam, CreateBatchJournalResponse200, CreateCryptoTransferForAccountBodyParam, CreateCryptoTransferForAccountMetadataParam, CreateCryptoTransferForAccountResponse200, CreateFundingWalletMetadataParam, CreateFundingWalletRecipientBankBodyParam, CreateFundingWalletRecipientBankMetadataParam, CreateFundingWalletRecipientBankResponse200, CreateFundingWalletRecipientBankResponseDefault, CreateFundingWalletResponse200, CreateFundingWalletResponseDefault, CreateFundingWalletWithdrawalBodyParam, CreateFundingWalletWithdrawalMetadataParam, CreateFundingWalletWithdrawalResponse200, CreateFundingWalletWithdrawalResponseDefault, CreateJournalBodyParam, CreateJournalMetadataParam, CreateJournalResponse200, CreateJournalResponse400, CreateJournalResponse403, CreateJournalResponse404, CreateOrderForAccountBodyParam, CreateOrderForAccountMetadataParam, CreateOrderForAccountResponse200, CreateOrderForAccountResponse400, CreateOrderForAccountResponse403, CreateOrderForAccountResponse404, CreateRecipientBankBodyParam, CreateRecipientBankMetadataParam, CreateRecipientBankResponse200, CreateTransferForAccountBodyParam, CreateTransferForAccountMetadataParam, CreateTransferForAccountResponse200, CreateWatchlistForAccountBodyParam, CreateWatchlistForAccountMetadataParam, CreateWatchlistForAccountResponse200, CreateWhitelistedAddressBodyParam, CreateWhitelistedAddressMetadataParam, CreateWhitelistedAddressResponse200, DeleteAchRelationshipFromAccountMetadataParam, DeleteAllOrdersForAccountMetadataParam, DeleteAllOrdersForAccountResponse207, DeleteAllOrdersForAccountResponse400, DeleteAllOrdersForAccountResponse404, DeleteDeletev1TradingAccountsAccountIdWatchlistsWatchlistIdSymbolMetadataParam, DeleteFundingWalletRecipientBankMetadataParam, DeleteFundingWalletRecipientBankResponseDefault, DeleteJournalByIdMetadataParam, DeleteOrderForAccountMetadataParam, DeleteOrderForAccountResponse400, DeleteOrderForAccountResponse404, DeleteRecipientBankMetadataParam, DeleteTransferMetadataParam, DeleteV1InstantFundingSingleMetadataParam, DeleteV1InstantFundingSingleResponseDefault, DeleteV1RebalancingPortfoliosPortfolioIdMetadataParam, DeleteV1RebalancingRunsRunIdMetadataParam, DeleteV1RebalancingSubscriptionsSubscriptionIdMetadataParam, DeleteWatchlistFromAccountByIdMetadataParam, DeleteWhitelistedAddressMetadataParam, DemoDepositFundingBodyParam, DemoDepositFundingResponse200, DemoDepositFundingResponseDefault, DownloadDocFromAccountMetadataParam, GetAccountAchRelationshipsMetadataParam, GetAccountAchRelationshipsResponse200, GetAccountActivitiesByTypeMetadataParam, GetAccountActivitiesByTypeResponse200, GetAccountActivitiesMetadataParam, GetAccountActivitiesResponse200, GetAccountMetadataParam, GetAccountResponse200, GetAllAccountsMetadataParam, GetAllAccountsResponse200, GetAllJournalsMetadataParam, GetAllJournalsResponse200, GetAllJournalsResponse400, GetAllJournalsResponse422, GetAllOrdersForAccountMetadataParam, GetAllOrdersForAccountResponse200, GetAllOrdersForAccountResponse400, GetAllOrdersForAccountResponse404, GetAllWatchlistsForAccountMetadataParam, GetAllWatchlistsForAccountResponse200, GetAssetBySymbolOrIdMetadataParam, GetAssetBySymbolOrIdResponse200, GetAssetEntryRequirementsMetadataParam, GetAssetEntryRequirementsResponse200, GetAssetsMetadataParam, GetAssetsResponse200, GetCorporateAnnouncementsMetadataParam, GetCorporateAnnouncementsResponse200, GetCorporateAnnouncementsResponse400, GetCryptoFundingTransferMetadataParam, GetCryptoFundingTransferResponse200, GetCryptoTransferEstimateMetadataParam, GetCryptoTransferEstimateResponse200, GetCryptoTransferEstimateResponseDefault, GetDocsForAccountMetadataParam, GetDocsForAccountResponse200, GetDocsForAccountResponse404, GetFundingWalletMetadataParam, GetFundingWalletRecipientBankMetadataParam, GetFundingWalletRecipientBankResponseDefault, GetFundingWalletResponse200, GetFundingWalletResponseDefault, GetFundingWalletTransferByIdMetadataParam, GetFundingWalletTransferByIdResponse200, GetFundingWalletTransferByIdResponseDefault, GetFundingWalletTransfersMetadataParam, GetFundingWalletTransfersResponse200, GetFundingWalletTransfersResponseDefault, GetGetv1CorporateActionsAnnouncementsIdMetadataParam, GetOAuthClientMetadataParam, GetOAuthClientResponse200, GetOAuthClientResponse401, GetOptionContractSymbolOrIdMetadataParam, GetOptionContractSymbolOrIdResponse200, GetOptionContractSymbolOrIdResponse404, GetOptionsContractsMetadataParam, GetOptionsContractsResponse200, GetOrderForAccountMetadataParam, GetOrderForAccountResponse200, GetOrderForAccountResponse400, GetOrderForAccountResponse404, GetPositionsForAccountBySymbolMetadataParam, GetPositionsForAccountBySymbolResponse200, GetPositionsForAccountMetadataParam, GetPositionsForAccountResponse200, GetRecipientBanksMetadataParam, GetRecipientBanksResponse200, GetTradingAccountMetadataParam, GetTradingAccountResponse200, GetTransfersForAccountMetadataParam, GetTransfersForAccountResponse200, GetV1AccountTradingLimitsMetadataParam, GetV1AccountTradingLimitsResponse200, GetV1AccountsAccountIdCipMetadataParam, GetV1AccountsAccountIdCipResponse200, GetV1AccountsAccountIdDocumentsW8BenDocumentIdDownloadMetadataParam, GetV1AccountsAccountIdOnfidoSdkTokensMetadataParam, GetV1AccountsAccountIdOnfidoSdkTokensResponse200, GetV1AccountsPositionsMetadataParam, GetV1AccountsPositionsResponse200, GetV1Beta1LogosSymbolMetadataParam, GetV1EventsNtaMetadataParam, GetV1EventsNtaResponse200, GetV1GetEodCashInterestReportMetadataParam, GetV1GetEodCashInterestReportResponse200, GetV1GetEodCashInterestReportResponse400, GetV1GetEodCashInterestReportResponse401, GetV1GetEodCashInterestReportResponse429, GetV1GetEodCashInterestReportResponse500, GetV1InstantFundingAccountLimitsMetadataParam, GetV1InstantFundingAccountLimitsResponse200, GetV1InstantFundingAccountLimitsResponseDefault, GetV1InstantFundingCorrespondentLimitsResponse200, GetV1InstantFundingCorrespondentLimitsResponseDefault, GetV1InstantFundingListMetadataParam, GetV1InstantFundingListResponse200, GetV1InstantFundingListResponseDefault, GetV1InstantFundingReportsMetadataParam, GetV1InstantFundingReportsResponse200, GetV1InstantFundingReportsResponseDefault, GetV1InstantFundingSettlementsMetadataParam, GetV1InstantFundingSettlementsResponse200, GetV1InstantFundingSettlementsResponseDefault, GetV1InstantFundingSettlementsSingleMetadataParam, GetV1InstantFundingSettlementsSingleResponse200, GetV1InstantFundingSettlementsSingleResponseDefault, GetV1InstantFundingSingleMetadataParam, GetV1InstantFundingSingleResponse200, GetV1InstantFundingSingleResponseDefault, GetV1JitSettlementsMetadataParam, GetV1JitSettlementsResponse200, GetV1JitSettlementsResponseDefault, GetV1JitSettlementsSingleMetadataParam, GetV1JitSettlementsSingleResponse200, GetV1JitSettlementsSingleResponseDefault, GetV1JournalsJournalIdMetadataParam, GetV1JournalsJournalIdResponse200, GetV1ListAprTiersResponse200, GetV1ListAprTiersResponse401, GetV1ListAprTiersResponse429, GetV1ListAprTiersResponse500, GetV1ListFpslLoansMetadataParam, GetV1ListFpslLoansResponse200, GetV1ListFpslLoansResponse400, GetV1ListFpslLoansResponse401, GetV1ListFpslLoansResponse403, GetV1ListFpslLoansResponse500, GetV1ListFpslTiersResponse200, GetV1ListFpslTiersResponse401, GetV1ListFpslTiersResponse429, GetV1ListFpslTiersResponse500, GetV1RebalancingPortfoliosMetadataParam, GetV1RebalancingPortfoliosPortfolioIdMetadataParam, GetV1RebalancingPortfoliosPortfolioIdResponse200, GetV1RebalancingPortfoliosResponse200, GetV1RebalancingRunsMetadataParam, GetV1RebalancingRunsResponse200, GetV1RebalancingRunsRunIdMetadataParam, GetV1RebalancingRunsRunIdResponse200, GetV1RebalancingSubscriptionsMetadataParam, GetV1RebalancingSubscriptionsResponse200, GetV1RebalancingSubscriptionsSubscriptionIdMetadataParam, GetV1RebalancingSubscriptionsSubscriptionIdResponse200, GetV1ReportingEodAggregatePositionsMetadataParam, GetV1ReportingEodAggregatePositionsResponse200, GetV1ReportingEodPositionsMetadataParam, GetV1ReportingEodPositionsResponse200, GetV1TradingAccountsAccountIdAccountPortfolioHistoryMetadataParam, GetV1TradingAccountsAccountIdAccountPortfolioHistoryResponse200, GetV1TradingAccountsAccountIdOrdersEstimationBodyParam, GetV1TradingAccountsAccountIdOrdersEstimationMetadataParam, GetV1TradingAccountsAccountIdOrdersEstimationResponse200, GetV1TransfersJitLedgerIdBalancesMetadataParam, GetV1TransfersJitLedgerIdBalancesResponse200, GetV1TransfersJitLedgersResponse200, GetV1TransfersJitLimitsResponse200, GetV1TransfersJitReportsMetadataParam, GetV1TransfersJitReportsResponse200, GetWatchlistForAccountByIdMetadataParam, GetWatchlistForAccountByIdResponse200, IssueOAuthTokenBodyParam, IssueOAuthTokenResponse200, IssueOAuthTokenResponse401, IssueOAuthTokenResponse422, ListCryptoFundingTransfersMetadataParam, ListCryptoFundingTransfersResponse200, ListCryptoFundingTransfersResponseDefault, ListCryptoFundingWalletsMetadataParam, ListCryptoFundingWalletsResponse200, ListCryptoFundingWalletsResponseDefault, ListFundingDetailsMetadataParam, ListFundingDetailsResponse200, ListFundingDetailsResponseDefault, ListIraExcessContritbutionsResponse200, ListIraExcessContritbutionsResponseDefault, ListWhitelistedAddressMetadataParam, ListWhitelistedAddressResponse200, ListWhitelistedAddressResponseDefault, OptionDoNotExerciseBodyParam, OptionDoNotExerciseMetadataParam, OptionDoNotExerciseResponse200, OptionDoNotExerciseResponse403, OptionDoNotExerciseResponse422, OptionExerciseBodyParam, OptionExerciseMetadataParam, OptionExerciseResponse200, OptionExerciseResponse403, PatchAccountBodyParam, PatchAccountMetadataParam, PatchAccountResponse200, PatchAccountResponse400, PatchAccountResponse422, PatchPatchv1TradingAccountsAccountIdAccountConfigurationsBodyParam, PatchPatchv1TradingAccountsAccountIdAccountConfigurationsMetadataParam, PatchPatchv1TradingAccountsAccountIdAccountConfigurationsResponse200, PatchV1AccountsAccountIdOnfidoSdkBodyParam, PatchV1AccountsAccountIdOnfidoSdkMetadataParam, PatchV1RebalancingPortfoliosPortfolioIdBodyParam, PatchV1RebalancingPortfoliosPortfolioIdMetadataParam, PatchV1RebalancingPortfoliosPortfolioIdResponse200, PdtGetStatusMetadataParam, PdtGetStatusResponse200, PdtOneTimeRemovalMetadataParam, PdtOneTimeRemovalResponse200, PdtOneTimeRemovalResponse403, PostV1AccountsAccountIdActionsCloseMetadataParam, PostV1AccountsAccountIdCipBodyParam, PostV1AccountsAccountIdCipMetadataParam, PostV1InstantFundingBodyParam, PostV1InstantFundingResponse200, PostV1InstantFundingResponseDefault, PostV1InstantFundingSettlementsBodyParam, PostV1InstantFundingSettlementsResponse200, PostV1InstantFundingSettlementsResponseDefault, PostV1JitSettlementsBodyParam, PostV1JitSettlementsResponse200, PostV1JitSettlementsResponseDefault, PostV1JournalsReverseBatchBodyParam, PostV1JournalsReverseBatchResponse200, PostV1RebalancingPortfoliosBodyParam, PostV1RebalancingPortfoliosResponse200, PostV1RebalancingRunsBodyParam, PostV1RebalancingSubscriptionsBodyParam, PostV1RebalancingSubscriptionsResponse200, PostV1TradingAccountsAccountIdWatchlistsWatchlistIdBodyParam, PostV1TradingAccountsAccountIdWatchlistsWatchlistIdMetadataParam, PostV1TradingAccountsAccountIdWatchlistsWatchlistIdResponse200, QueryCountryInfosResponse200, QueryMarketCalendarMetadataParam, QueryMarketCalendarResponse200, QueryMarketClockResponse200, ReplaceOrderForAccountBodyParam, ReplaceOrderForAccountMetadataParam, ReplaceOrderForAccountResponse200, ReplaceOrderForAccountResponse400, ReplaceOrderForAccountResponse404, ReplaceWatchlistForAccountByIdBodyParam, ReplaceWatchlistForAccountByIdMetadataParam, ReplaceWatchlistForAccountByIdResponse200, RequestListOptionsApprovalsMetadataParam, RequestListOptionsApprovalsResponse200, RequestListOptionsApprovalsResponse400, RequestListOptionsApprovalsResponse401, RequestListOptionsApprovalsResponse403, RequestOptionsForAccountBodyParam, RequestOptionsForAccountMetadataParam, RequestOptionsForAccountResponse200, RequestOptionsForAccountResponse400, RequestOptionsForAccountResponse401, RequestOptionsForAccountResponse422, SubscribeToAdminActionSseMetadataParam, SubscribeToAdminActionSseResponse200, SubscribeToFundingStatusSseMetadataParam, SubscribeToFundingStatusSseResponse200, SubscribeToJournalStatusSseMetadataParam, SubscribeToJournalStatusSseResponse200, SubscribeToJournalStatusV2SseMetadataParam, SubscribeToJournalStatusV2SseResponse200, SubscribeToTradeSseMetadataParam, SubscribeToTradeSseResponse200, SubscribeToTradeV2SseMetadataParam, SubscribeToTradeV2SseResponse200, SubscribeToTransferStatusSseMetadataParam, SubscribeToTransferStatusSseResponse200, SuscribeToAccountStatusSseMetadataParam, SuscribeToAccountStatusSseResponse200, UploadDocToAccountBodyParam, UploadDocToAccountMetadataParam, UploadDocToAccountResponse400, UploadDocToAccountResponse404, UsTreasuriesMetadataParam, UsTreasuriesResponse200, UsTreasuriesResponse400, UsTreasuriesResponse429 } from './types';
