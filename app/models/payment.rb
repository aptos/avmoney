class Payment < CouchRest::Model::Base
  property :_id, String
  property :invoice_id, String
  property :client_id, String
  property :client_name, String
  property :invoice_number, Integer
  property :project, String
  property :amount, Float
  property :notes, String
  property :date, Date

  timestamps!

  design do
    view :by_client_name
  end

  design do
    view :by_invoice_id,
   :map =>
   "function(doc) {
      if (doc['type'] === 'Payment') {
        emit(doc.invoice_id, doc.amount);
      }
    }",
    :reduce =>
    '_sum'
  end
end