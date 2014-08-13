class Invoice < CouchRest::Model::Base
  validates_uniqueness_of :invoice_number, scope: :client_id, :message => "This Client already has an Invoice with that number"

  property :_id, String
  property :invoice_number, Integer
  property :po_number, String
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
    view :by_client_id_and_status
  end

  design do
    view :by_client,
    :map =>
    "function(doc) {
      if (doc['type'] == 'Invoice') {
        var paid = (!!doc.paid) ? doc.paid : 0.0;
        emit(doc.client_id, { created_at: doc.created_at, name: doc.name, client_id: doc.client_id, project: doc.project, invoice_number: doc.invoice_number, invoice_total: doc.invoice_total, paid: paid,  status: doc.status});
      }
    }"
  end

  design do
    view :by_status,
    :map =>
    "function(doc) {
      if (doc['type'] == 'Invoice') {
        var paid = (!!doc.paid) ? doc.paid : 0.0;
        emit(doc.status, { open_date: doc.open_date, name: doc.name, client_id: doc.client_id, project: doc.project, invoice_number: doc.invoice_number, invoice_total: doc.invoice_total, paid: paid,  status: doc.status});
      }
    }"
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

  def self.stats client=nil
    startkey = [client]
    client = client || {}
    endkey = [client, {}]
    Rails.logger.info "Keys: #{startkey}, #{endkey}"
    rows = self.by_client_id_and_status.startkey(startkey).endkey(endkey).reduce.group_level(2).rows
    @stats = Hash.new
    rows.each {|r| @stats[r["key"][0]] = {}}
    rows.each {|r| @stats[r["key"][0]][r["key"][1]] = r["value"]}
    return @stats
  end

end