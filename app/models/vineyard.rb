class Vineyard < CouchRest::Model::Base
  property :_id, String
  property :name, String
  property :owner, String
  property :owner_name, String
  property :appellation, String
  property :location, String
  property :latlong, Array
  property :center, Hash
  property :elevation, Float
  property :description, String
  property :image_url, String
  property :methods, Hash
  property :blocks, Array
  property :attachments, Hash
  property :published, String
  property :views, Integer, :default => 0

  timestamps!

  design do
    view :by_owner
  end

  design do
    view :by_name
  end

  def visit
    self.views = 0 unless self.views
    self.views += 1
    self.save
  end
end