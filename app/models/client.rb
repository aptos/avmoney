class Client < CouchRest::Model::Base
  validates_uniqueness_of :name, :case_sensitive => false, :message => "We already have client with that name"

  property :_id, String
  property :name, String
  property :rate, Float
  property :tax_rate, Float
  property :address, String
  property :deliveries, String
  property :contact, String
  property :email, String
  property :phone, String
  property :cell, String
  property :contact2, String
  property :email2, String
  property :phone2, String
  property :cell2, String
  property :projects, [String]
  property :base_invoice_id, Integer, default: 1
  property :invoice_notes, String
  property :archived_projects, [String]
  property :archived, TrueClass, default: false
  timestamps!

  design do
    view :by_name
  end

  def next_invoice
    invoice_ids = Invoice.by_name.key(self.name).rows.map{|r| r["value"]}.sort
    return base_invoice_id if invoice_ids.empty?

    missing = (base_invoice_id..invoice_ids.last).to_a - invoice_ids
    if missing.empty?
      return invoice_ids.last + 1
    else
      return missing[0]
    end
  end

  def invoice_stats
    @stats = {}
    i = Invoice.by_client_id_and_status.startkey([self._id]).endkey([self._id,{}]).reduce.group_level(2).rows
    i.each {|r| @stats[r["key"][1]] = r["value"]}
    @stats
  end

end