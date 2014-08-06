class Invoice < CouchRest::Model::Base
  validates_uniqueness_of :invoice_number, scope: :client_id, :message => "This Client already has an Invoice with that number"

  property :_id, String
  property :invoice_number, Integer
  property :client_id, String
  property :name, String
  property :client_data, Hash
  property :hours_sum, Float
  property :hours_amount, Float
  property :expenses, Float
  property :tax, Float
  property :invoice_total, Float
  property :activities, Array
  property :project, String
  property :status, String, default: 'Open'
  property :open_date, Date
  property :paid_date, Date
  property :paid, Float

  timestamps!

  design do
    view :by_status
  end

  design do
    view :by_name,
    :map =>
    "function(doc) {
    if ((doc['type'] == 'Invoice') && (doc['name'] != null)) {
      emit(doc['name'], doc.invoice_number);
    }
    };"
  end

end